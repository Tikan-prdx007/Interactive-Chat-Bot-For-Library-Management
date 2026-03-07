const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "library.db");

const DEFAULT_MEMBER_ID = Number.parseInt(process.env.DEFAULT_MEMBER_ID || "1", 10);
const DEFAULT_MEMBER_NAME = process.env.DEFAULT_MEMBER_NAME || "Tikan Samad";
const DEFAULT_COLLEGE_NAME = process.env.DEFAULT_COLLEGE_NAME || "KMBB CET";
const DEFAULT_SUBJECT = process.env.DEFAULT_SUBJECT || "Data Structure";

function openDb() {
  return new sqlite3.Database(DB_PATH);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function hasColumn(db, tableName, columnName) {
  const rows = await all(db, `PRAGMA table_info(${tableName});`);
  return rows.some((r) => String(r.name).toLowerCase() === String(columnName).toLowerCase());
}

async function initDb() {
  const db = openDb();
  await run(db, "PRAGMA foreign_keys = ON;");

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT
    );`
  );

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      shelf_location TEXT,
      total_copies INTEGER NOT NULL DEFAULT 1,
      available_copies INTEGER NOT NULL DEFAULT 1
    );`
  );

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      issued_at TEXT NOT NULL,
      due_at TEXT NOT NULL,
      returned_at TEXT,
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
      FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
    );`
  );

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      reserved_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      fulfilled_at TEXT,
      cancelled_at TEXT,
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
      FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
    );`
  );
  await run(
    db,
    "CREATE INDEX IF NOT EXISTS idx_reservations_book_status ON reservations(book_id, status, id);"
  );

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS member_context (
      member_id INTEGER NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (member_id, key),
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
    );`
  );

  const booksHasShelf = await hasColumn(db, "books", "shelf_location").catch(() => true);
  if (!booksHasShelf) await run(db, "ALTER TABLE books ADD COLUMN shelf_location TEXT;");

  await run(
    db,
    `UPDATE books
     SET shelf_location = CASE
       WHEN shelf_location IS NOT NULL AND TRIM(shelf_location) <> '' THEN shelf_location
       WHEN LOWER(category) = 'programming' THEN 'Shelf B1'
       WHEN LOWER(category) = 'fiction' THEN 'Shelf A2'
       WHEN LOWER(category) = 'self-help' THEN 'Shelf C1'
       WHEN LOWER(category) = 'education' THEN 'Shelf E2'
       ELSE 'Shelf Z1'
     END
     WHERE shelf_location IS NULL OR TRIM(shelf_location) = '';`
  );

  return db;
}

async function setMemberContext(db, { memberId, key, value }) {
  const updatedAt = new Date().toISOString();
  await run(
    db,
    `INSERT INTO member_context (member_id, key, value, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(member_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
    [memberId, key, JSON.stringify(value ?? null), updatedAt]
  );
}

async function getMemberContext(db, { memberId, key }) {
  const row = await get(db, "SELECT value FROM member_context WHERE member_id = ? AND key = ?;", [
    memberId,
    key,
  ]);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
}

async function ensureDefaultMemberProfile(db) {
  const member = await get(db, "SELECT id, name, email FROM members WHERE id = ?;", [
    DEFAULT_MEMBER_ID,
  ]);
  if (!member) {
    await run(db, "INSERT INTO members (id, name, email) VALUES (?, ?, ?);", [
      DEFAULT_MEMBER_ID,
      DEFAULT_MEMBER_NAME,
      null,
    ]);
  } else {
    const currentName = String(member.name || "").trim();
    if (!currentName || currentName.toLowerCase() === "demo user") {
      await run(db, "UPDATE members SET name = ? WHERE id = ?;", [
        DEFAULT_MEMBER_NAME,
        DEFAULT_MEMBER_ID,
      ]);
    }
  }

  const college = await getMemberContext(db, { memberId: DEFAULT_MEMBER_ID, key: "collegeName" });
  if (!college) {
    await setMemberContext(db, {
      memberId: DEFAULT_MEMBER_ID,
      key: "collegeName",
      value: DEFAULT_COLLEGE_NAME,
    });
  }
  const subject = await getMemberContext(db, { memberId: DEFAULT_MEMBER_ID, key: "currentSubject" });
  if (!subject) {
    await setMemberContext(db, {
      memberId: DEFAULT_MEMBER_ID,
      key: "currentSubject",
      value: DEFAULT_SUBJECT,
    });
  }
}

async function seedIfEmpty(db) {
  const row = await get(db, "SELECT COUNT(*) AS c FROM books;");
  if (row && row.c > 0) return;

  const books = [
    ["Clean Code", "Robert C. Martin", "Programming", "Shelf B2", 5, 5],
    ["The Pragmatic Programmer", "Andrew Hunt", "Programming", "Shelf B1", 4, 4],
    ["Introduction to Algorithms", "Cormen et al.", "Education", "Shelf E2", 2, 2],
    ["The Hobbit", "J.R.R. Tolkien", "Fiction", "Shelf A2", 4, 4],
    ["Harry Potter and the Sorcerer's Stone", "J.K. Rowling", "Fiction", "Shelf A3", 6, 6],
    ["Atomic Habits", "James Clear", "Self-Help", "Shelf C1", 3, 3]
  ];

  for (const b of books) {
    await run(
      db,
      "INSERT INTO books (title, author, category, shelf_location, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?);",
      b
    );
  }
}

module.exports = {
  DB_PATH,
  DEFAULT_MEMBER_ID,
  DEFAULT_MEMBER_NAME,
  DEFAULT_COLLEGE_NAME,
  DEFAULT_SUBJECT,
  openDb,
  initDb,
  seedIfEmpty,
  ensureDefaultMemberProfile,
  run,
  get,
  all,
  setMemberContext,
  getMemberContext
};

