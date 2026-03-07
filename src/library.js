const { all, get, run } = require("./db");

function isoNow() {
  return new Date().toISOString();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function normalizeQuery(q) {
  return String(q || "").trim();
}

async function searchBooks(db, { title, author, category }) {
  const filters = [];
  const params = [];

  if (title) {
    filters.push("LOWER(title) LIKE LOWER(?)");
    params.push(`%${normalizeQuery(title)}%`);
  }
  if (author) {
    filters.push("LOWER(author) LIKE LOWER(?)");
    params.push(`%${normalizeQuery(author)}%`);
  }
  if (category) {
    filters.push("LOWER(category) LIKE LOWER(?)");
    params.push(`%${normalizeQuery(category)}%`);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  return await all(
    db,
    `SELECT id, title, author, category, shelf_location, total_copies, available_copies
     FROM books
     ${where}
     ORDER BY title ASC
     LIMIT 25;`,
    params
  );
}

async function getBookById(db, bookId) {
  const book = await get(
    db,
    `SELECT id, title, author, category, shelf_location, total_copies, available_copies
     FROM books
     WHERE id = ?;`,
    [bookId]
  );
  return book || null;
}

async function getBookByTitle(db, title) {
  const t = normalizeQuery(title);
  if (!t) return null;
  const book = await get(
    db,
    `SELECT id, title, author, category, shelf_location, total_copies, available_copies
     FROM books
     WHERE LOWER(title) = LOWER(?);`,
    [t]
  );
  return book || null;
}

async function checkAvailability(db, { bookId, title }) {
  const book = bookId ? await getBookById(db, bookId) : await getBookByTitle(db, title);
  if (!book) return { ok: false, reason: "BOOK_NOT_FOUND" };
  return { ok: true, book, available: book.available_copies > 0 };
}

async function reserveBook(db, { memberId, bookId, title }) {
  const book = bookId ? await getBookById(db, bookId) : await getBookByTitle(db, title);
  if (!book) return { ok: false, reason: "BOOK_NOT_FOUND" };

  const existing = await get(
    db,
    `SELECT id, member_id, book_id, reserved_at, status
     FROM reservations
     WHERE member_id = ? AND book_id = ? AND status = 'ACTIVE'
     ORDER BY id DESC
     LIMIT 1;`,
    [memberId, book.id]
  );
  if (existing) {
    const posRow = await get(
      db,
      "SELECT COUNT(*) AS c FROM reservations WHERE book_id = ? AND status = 'ACTIVE' AND id <= ?;",
      [book.id, existing.id]
    );
    const totalRow = await get(
      db,
      "SELECT COUNT(*) AS c FROM reservations WHERE book_id = ? AND status = 'ACTIVE';",
      [book.id]
    );
    return {
      ok: true,
      alreadyReserved: true,
      book,
      reservation: existing,
      queue: { position: posRow?.c ?? 1, total: totalRow?.c ?? 1 }
    };
  }

  const reservedAt = isoNow();
  const r = await run(
    db,
    `INSERT INTO reservations (member_id, book_id, reserved_at, status)
     VALUES (?, ?, ?, 'ACTIVE');`,
    [memberId, book.id, reservedAt]
  );
  const reservationId = r.lastID;
  const reservation = await get(
    db,
    "SELECT id, member_id, book_id, reserved_at, status FROM reservations WHERE id = ?;",
    [reservationId]
  );
  const posRow = await get(
    db,
    "SELECT COUNT(*) AS c FROM reservations WHERE book_id = ? AND status = 'ACTIVE' AND id <= ?;",
    [book.id, reservationId]
  );
  const totalRow = await get(
    db,
    "SELECT COUNT(*) AS c FROM reservations WHERE book_id = ? AND status = 'ACTIVE';",
    [book.id]
  );
  return {
    ok: true,
    alreadyReserved: false,
    book,
    reservation,
    queue: { position: posRow?.c ?? 1, total: totalRow?.c ?? 1 }
  };
}

async function issueBook(db, { memberId, bookId, title, loanDays = 14 }) {
  const book = bookId ? await getBookById(db, bookId) : await getBookByTitle(db, title);
  if (!book) return { ok: false, reason: "BOOK_NOT_FOUND" };
  if (book.available_copies <= 0) return { ok: false, reason: "NOT_AVAILABLE", book };

  const firstActiveReservation = await get(
    db,
    `SELECT id, member_id, book_id, reserved_at
     FROM reservations
     WHERE book_id = ? AND status = 'ACTIVE'
     ORDER BY id ASC
     LIMIT 1;`,
    [book.id]
  );
  if (firstActiveReservation && firstActiveReservation.member_id !== memberId) {
    return { ok: false, reason: "RESERVED_FOR_OTHER", book };
  }

  const now = new Date();
  const due = addDays(now, loanDays);

  await run(db, "BEGIN TRANSACTION;");
  try {
    await run(
      db,
      `INSERT INTO loans (member_id, book_id, issued_at, due_at, returned_at)
       VALUES (?, ?, ?, ?, NULL);`,
      [memberId, book.id, now.toISOString(), due.toISOString()]
    );

    await run(
      db,
      `UPDATE books
       SET available_copies = available_copies - 1
       WHERE id = ?;`,
      [book.id]
    );

    if (firstActiveReservation) {
      await run(
        db,
        `UPDATE reservations
         SET status = 'FULFILLED', fulfilled_at = ?
         WHERE id = ?;`,
        [isoNow(), firstActiveReservation.id]
      );
    }

    await run(db, "COMMIT;");
  } catch (e) {
    await run(db, "ROLLBACK;");
    throw e;
  }

  const loan = await get(
    db,
    `SELECT id, member_id, book_id, issued_at, due_at, returned_at
     FROM loans
     WHERE member_id = ? AND book_id = ? AND returned_at IS NULL
     ORDER BY id DESC
     LIMIT 1;`,
    [memberId, book.id]
  );

  return { ok: true, book, loan };
}

async function returnBook(db, { memberId, bookId, title }) {
  const book = bookId ? await getBookById(db, bookId) : await getBookByTitle(db, title);
  if (!book) return { ok: false, reason: "BOOK_NOT_FOUND" };

  const loan = await get(
    db,
    `SELECT l.id, l.member_id, l.book_id, l.issued_at, l.due_at, l.returned_at
     FROM loans l
     WHERE l.member_id = ? AND l.book_id = ? AND l.returned_at IS NULL
     ORDER BY l.id DESC
     LIMIT 1;`,
    [memberId, book.id]
  );
  if (!loan) return { ok: false, reason: "NO_ACTIVE_LOAN", book };

  const returnedAt = isoNow();
  await run(db, "BEGIN TRANSACTION;");
  try {
    await run(db, "UPDATE loans SET returned_at = ? WHERE id = ?;", [returnedAt, loan.id]);
    await run(
      db,
      "UPDATE books SET available_copies = available_copies + 1 WHERE id = ?;",
      [book.id]
    );
    await run(db, "COMMIT;");
  } catch (e) {
    await run(db, "ROLLBACK;");
    throw e;
  }

  const updatedLoan = await get(db, "SELECT * FROM loans WHERE id = ?;", [loan.id]);
  const nextReservation = await get(
    db,
    `SELECT id, member_id, book_id, reserved_at
     FROM reservations
     WHERE book_id = ? AND status = 'ACTIVE'
     ORDER BY id ASC
     LIMIT 1;`,
    [book.id]
  );
  return { ok: true, book, loan: updatedLoan, nextReservation };
}

function calcFine({ dueAt, returnedAt, finePerDay = 5 }) {
  const due = new Date(dueAt);
  const returned = returnedAt ? new Date(returnedAt) : new Date();
  const diffMs = returned.getTime() - due.getTime();
  const daysLate = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return { daysLate, fine: daysLate * finePerDay };
}

async function dueDate(db, { memberId, bookId, title }) {
  const book = bookId ? await getBookById(db, bookId) : await getBookByTitle(db, title);
  if (!book) return { ok: false, reason: "BOOK_NOT_FOUND" };

  const loan = await get(
    db,
    `SELECT l.id, l.member_id, l.book_id, l.issued_at, l.due_at, l.returned_at
     FROM loans l
     WHERE l.member_id = ? AND l.book_id = ? AND l.returned_at IS NULL
     ORDER BY l.id DESC
     LIMIT 1;`,
    [memberId, book.id]
  );
  if (!loan) return { ok: false, reason: "NO_ACTIVE_LOAN", book };
  return { ok: true, book, loan };
}

async function fineForLoan(db, { memberId, bookId, title, finePerDay = 5 }) {
  const dd = await dueDate(db, { memberId, bookId, title });
  if (!dd.ok) return dd;
  const fine = calcFine({ dueAt: dd.loan.due_at, returnedAt: null, finePerDay });
  return { ok: true, book: dd.book, loan: dd.loan, fine };
}

async function suggestSimilar(db, { bookId, title, limit = 5 }) {
  const book = bookId ? await getBookById(db, bookId) : await getBookByTitle(db, title);
  if (!book) return { ok: false, reason: "BOOK_NOT_FOUND" };
  const rows = await all(
    db,
    `SELECT id, title, author, category, shelf_location, total_copies, available_copies
     FROM books
     WHERE LOWER(category) = LOWER(?) AND id <> ?
     ORDER BY available_copies DESC, title ASC
     LIMIT ?;`,
    [book.category, book.id, limit]
  );
  return { ok: true, book, suggestions: rows };
}

module.exports = {
  searchBooks,
  checkAvailability,
  reserveBook,
  issueBook,
  returnBook,
  dueDate,
  fineForLoan,
  suggestSimilar,
  calcFine
};

