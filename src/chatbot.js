const {
  searchBooks,
  checkAvailability,
  reserveBook,
  issueBook,
  returnBook,
  dueDate,
  fineForLoan,
  suggestSimilar
} = require("./library");
const { get, getMemberContext } = require("./db");

const LIBRARY_INFO = {
  timings: ["Mon–Fri: 9:00 AM – 6:00 PM", "Sat: 10:00 AM – 4:00 PM", "Sun: Closed"],
  rules: [
    "Carry your library card / member ID.",
    "Maintain silence in reading areas.",
    "Loan period: 14 days (default).",
    "Fine: ₹5 per day after the due date (demo value).",
    "No food or drinks near computers/books."
  ]
};

function clean(s) {
  return String(s || "").trim();
}

function firstName(fullName) {
  const s = clean(fullName);
  if (!s) return "";
  return s.split(/\s+/)[0] || "";
}

function toIntMaybe(x) {
  const n = Number.parseInt(String(x), 10);
  return Number.isFinite(n) ? n : null;
}

function formatBooks(books) {
  if (!books.length) return "No matching books found.";
  return (
    "Here are the top matches:\n" +
    books
      .map(
        (b) =>
          `- [${b.id}] ${b.title} — ${b.author} (${b.category}) | Shelf: ${b.shelf_location || "—"} | Available: ${b.available_copies}/${b.total_copies}`
      )
      .join("\n")
  );
}

function helpText() {
  return [
    "Try things like:",
    "- search title Clean Code",
    "- search author Tolkien",
    "- search category Fiction",
    "- availability 3   (or: availability title Clean Code)",
    "- reserve 3        (or: reserve title The Hobbit)",
    "- similar 3        (or: similar title The Hobbit)",
    "- issue 3          (or: issue title The Hobbit)",
    "- return 3         (or: return title The Hobbit)",
    "- due 3            (or: due title The Hobbit)",
    "- fine 3           (or: fine title The Hobbit)",
    "- dashboard        (show your study snapshot)",
    "- timings",
    "- rules"
  ].join("\n");
}

function parseMessage(message) {
  const m = clean(message);
  const lower = m.toLowerCase();

  if (!m) return { intent: "EMPTY" };
  if (["hi", "hello", "hey", "start"].includes(lower)) return { intent: "GREET" };
  if (["help", "/help", "h"].includes(lower)) return { intent: "HELP" };
  if (["timings", "hours", "time"].includes(lower)) return { intent: "TIMINGS" };
  if (["rules", "policy", "policies"].includes(lower)) return { intent: "RULES" };
  if (
    ["dashboard", "progress", "my progress", "study dashboard", "analytics"].includes(lower)
  ) {
    return { intent: "DASHBOARD" };
  }

  if (lower.startsWith("search ")) {
    const rest = m.slice(7).trim();
    const [field, ...qParts] = rest.split(/\s+/);
    const q = qParts.join(" ").trim();
    const f = (field || "").toLowerCase();
    if (["title", "author", "category"].includes(f) && q) return { intent: "SEARCH", field: f, query: q };
    if (rest) return { intent: "SEARCH", field: "title", query: rest };
  }

  if (lower.startsWith("availability ")) {
    const rest = m.slice("availability ".length).trim();
    const parts = rest.split(/\s+/);
    const maybeId = toIntMaybe(parts[0]);
    if (maybeId) return { intent: "AVAILABILITY", bookId: maybeId };
    if (parts[0]?.toLowerCase() === "title") return { intent: "AVAILABILITY", title: rest.slice(6).trim() };
    return { intent: "AVAILABILITY", title: rest };
  }

  for (const verb of ["reserve", "similar", "issue", "return", "due", "fine"]) {
    if (lower.startsWith(verb + " ")) {
      const rest = m.slice((verb + " ").length).trim();
      const parts = rest.split(/\s+/);
      const maybeId = toIntMaybe(parts[0]);
      if (maybeId) return { intent: verb.toUpperCase(), bookId: maybeId };
      if (parts[0]?.toLowerCase() === "title") return { intent: verb.toUpperCase(), title: rest.slice(6).trim() };
      return { intent: verb.toUpperCase(), title: rest };
    }
  }

  return { intent: "UNKNOWN" };
}

async function handleChat(db, { message, memberId = 1 }) {
  const parsed = parseMessage(message);
  const member = (await get(db, "SELECT id, name FROM members WHERE id = ?;", [memberId]).catch(() => null)) || null;
  const name = firstName(member?.name) || "there";
  const collegeName = (await getMemberContext(db, { memberId, key: "collegeName" }).catch(() => null)) || null;

  switch (parsed.intent) {
    case "EMPTY":
      return {
        reply: `Welcome back, ${name}! I’m LibraMate${collegeName ? ` from ${collegeName}` : ""}.\n\nYou’re in 📚 Library Management Mode.\n\nTell me a book title/author/category, or try:\n${helpText()}`
      };
    case "GREET":
      return {
        reply: `Hi ${name}! I’m LibraMate${collegeName ? ` from ${collegeName}` : ""}.\n\nWhat would you like to do?\n- Search a book (e.g., \`search title Clean Code\`)\n- Check availability (\`availability 1\`)\n- Reserve (\`reserve 1\`)`
      };
    case "HELP":
      return { reply: `📚 Library Management Mode — commands\n\n${helpText()}` };
    case "TIMINGS":
      return { reply: "Library timings:\n" + LIBRARY_INFO.timings.map((t) => `- ${t}`).join("\n") };
    case "RULES":
      return { reply: "Library rules:\n" + LIBRARY_INFO.rules.map((r) => `- ${r}`).join("\n") };
    case "DASHBOARD": {
      const studyHours =
        (await getMemberContext(db, { memberId, key: "studyHoursThisWeek" }).catch(() => null)) ??
        8;
      const topicsCovered =
        (await getMemberContext(db, { memberId, key: "topicsCovered" }).catch(() => null)) ?? 4;
      const avgQuiz =
        (await getMemberContext(db, { memberId, key: "avgQuizScore" }).catch(() => null)) ?? 78;
      const strongest =
        (await getMemberContext(db, { memberId, key: "strongestSubject" }).catch(() => null)) ??
        "Data Structure";
      const needsImprovement =
        (await getMemberContext(db, { memberId, key: "needsImprovement" }).catch(() => null)) ??
        "Mathematics";
      const readingStreak =
        (await getMemberContext(db, { memberId, key: "readingStreakDays" }).catch(() => null)) ??
        3;
      const improvementPct =
        (await getMemberContext(db, { memberId, key: "improvementPercent" }).catch(() => null)) ??
        10;

      const snapshot =
        "📊 Your Study Snapshot\n\n" +
        `Study Hours This Week: ${studyHours} hrs\n` +
        `Topics Covered: ${topicsCovered}\n` +
        `Average Quiz Score: ${avgQuiz}%\n` +
        `Strongest Subject: ${strongest}\n` +
        `Needs Improvement: ${needsImprovement}\n` +
        `Reading Streak: ${readingStreak} day(s)\n` +
        `Improvement: ${improvementPct}% vs last period\n\n` +
        `You’re building good consistency, ${name} — keep going.\n` +
        `Suggestion: Spend 20 focused minutes today on ${needsImprovement} to gradually close the gap.`;

      return { reply: snapshot };
    }
    case "SEARCH": {
      const args =
        parsed.field === "title"
          ? { title: parsed.query }
          : parsed.field === "author"
            ? { author: parsed.query }
            : { category: parsed.query };
      const books = await searchBooks(db, args);
      if (!books.length) {
        return {
          reply:
            `I couldn’t find that exact match, ${name}.\n\n` +
            "Here are a few ways to broaden it:\n" +
            "- Try fewer keywords (e.g., `search title Code`)\n" +
            "- Search by author (`search author ...`)\n" +
            "- Search by category (`search category Programming`)"
        };
      }
      return {
        reply:
          `${formatBooks(books)}\n\nNext step:\n- Check one: \`availability ${books[0].id}\`\n- Or reserve: \`reserve ${books[0].id}\``,
        data: { books }
      };
    }
    case "AVAILABILITY": {
      const res = await checkAvailability(db, { bookId: parsed.bookId ?? null, title: parsed.title ?? null });
      if (!res.ok) {
        return { reply: `I couldn’t find that book, ${name}.\n\nTry:\n- \`search title <book name>\`\n- \`search author <author>\`` };
      }
      const shelf = res.book.shelf_location || "—";
      const title = res.book.title;
      const availabilityLine = res.available
        ? `Great news, ${name}! “${title}” is **available**.`
        : `“${title}” is **currently unavailable**.`;

      const suggest = await suggestSimilar(db, { bookId: res.book.id, limit: 3 }).catch(() => null);
      const suggestions =
        suggest?.ok && suggest.suggestions?.length
          ? "\n\n📌 Similar picks you might like:\n" +
            suggest.suggestions
              .map(
                (b) =>
                  `- [${b.id}] ${b.title} — ${b.author} | Shelf: ${b.shelf_location || "—"} | Available: ${b.available_copies}/${b.total_copies}`
              )
              .join("\n")
          : "";

      return {
        reply:
          `${availabilityLine}\n` +
          `- Shelf location: ${shelf}\n` +
          `- Copies: ${res.book.available_copies}/${res.book.total_copies}\n\n` +
          (res.available
            ? "Would you like me to **issue** it now or **reserve** it?\n- `issue " +
              res.book.id +
              "`\n- `reserve " +
              res.book.id +
              "`"
            : "Want me to place a **reservation** for you?\n- `reserve " + res.book.id + "`") +
          suggestions,
        data: { book: res.book }
      };
    }
    case "RESERVE": {
      const res = await reserveBook(db, { memberId, bookId: parsed.bookId ?? null, title: parsed.title ?? null });
      if (!res.ok) return { reply: `I couldn’t find that book, ${name}. Try \`search title ...\`.` };
      const already = res.alreadyReserved ? "Already reserved ✅" : "Reserved ✅";
      return {
        reply:
          `${already}, ${name}.\n\n` +
          `📌 Reservation details\n` +
          `- Book: “${res.book.title}”\n` +
          `- Shelf: ${res.book.shelf_location || "—"}\n` +
          `- Queue position: ${res.queue.position} of ${res.queue.total}\n\n` +
          `Next action:\n- Check availability: \`availability ${res.book.id}\`\n- See similar books: \`similar ${res.book.id}\``,
        data: { book: res.book, reservation: res.reservation, queue: res.queue }
      };
    }
    case "SIMILAR": {
      const res = await suggestSimilar(db, { bookId: parsed.bookId ?? null, title: parsed.title ?? null, limit: 5 });
      if (!res.ok) return { reply: `I couldn’t find that book, ${name}. Try \`search title ...\`.` };
      if (!res.suggestions.length) {
        return { reply: `Nice choice, ${name} — I don’t have close matches in the same category yet.\n\nTry:\n- \`search category ${res.book.category}\`` };
      }
      return {
        reply:
          `📌 Similar to “${res.book.title}” (${res.book.category})\n\n` +
          res.suggestions
            .map(
              (b) =>
                `- [${b.id}] ${b.title} — ${b.author} | Shelf: ${b.shelf_location || "—"} | Available: ${b.available_copies}/${b.total_copies}`
            )
            .join("\n") +
          `\n\nWant me to reserve one? Example:\n- \`reserve ${res.suggestions[0].id}\``,
        data: { book: res.book, suggestions: res.suggestions }
      };
    }
    case "ISSUE": {
      const res = await issueBook(db, { memberId, bookId: parsed.bookId ?? null, title: parsed.title ?? null, loanDays: 14 });
      if (!res.ok) {
        if (res.reason === "NOT_AVAILABLE") {
          return { reply: `Sorry ${name} — “${res.book.title}” isn’t available right now.\n\nWould you like me to reserve it?\n- \`reserve ${res.book.id}\`` };
        }
        if (res.reason === "RESERVED_FOR_OTHER") {
          return { reply: `That copy is currently reserved for another student, ${name}.\n\nI can place you in the queue:\n- \`reserve ${res.book.id}\`` };
        }
        return { reply: `I couldn’t find that book, ${name}. Try \`search title ...\` first.` };
      }
      return {
        reply:
          `Done, ${name}! ✅ Issued “${res.book.title}”.\n` +
          `- Due date: ${new Date(res.loan.due_at).toLocaleString()}\n` +
          `- Shelf: ${res.book.shelf_location || "—"}\n\n` +
          `Next action:\n- Check due anytime: \`due ${res.book.id}\`\n- Return when finished: \`return ${res.book.id}\``,
        data: { book: res.book, loan: res.loan }
      };
    }
    case "RETURN": {
      const res = await returnBook(db, { memberId, bookId: parsed.bookId ?? null, title: parsed.title ?? null });
      if (!res.ok) {
        if (res.reason === "NO_ACTIVE_LOAN") return { reply: `You don’t have an active loan for "${res.book.title}".` };
        return { reply: `I couldn’t find that book, ${name}. Try \`search title ...\`.` };
      }
      const nextUp = res.nextReservation
        ? `\n\nNote: This book has an active reservation queue (next member ID: ${res.nextReservation.member_id}).`
        : "";
      return {
        reply: `Returned “${res.book.title}”. Thanks, ${name}! ✅${nextUp}\n\nWant another recommendation in the same category?\n- \`similar ${res.book.id}\``,
        data: { book: res.book, loan: res.loan }
      };
    }
    case "DUE": {
      const res = await dueDate(db, { memberId, bookId: parsed.bookId ?? null, title: parsed.title ?? null });
      if (!res.ok) {
        if (res.reason === "NO_ACTIVE_LOAN") return { reply: `No active loan found for "${res.book.title}".` };
        return { reply: `I couldn’t find that book, ${name}. Try \`search title ...\`.` };
      }
      return {
        reply:
          `📅 Due date for “${res.book.title}”\n` +
          `- Due on: ${new Date(res.loan.due_at).toLocaleString()}\n\n` +
          `Next action:\n- Return: \`return ${res.book.id}\`\n- Check fine: \`fine ${res.book.id}\``,
        data: { book: res.book, loan: res.loan }
      };
    }
    case "FINE": {
      const res = await fineForLoan(db, { memberId, bookId: parsed.bookId ?? null, title: parsed.title ?? null, finePerDay: 5 });
      if (!res.ok) {
        if (res.reason === "NO_ACTIVE_LOAN") return { reply: `No active loan found for "${res.book.title}".` };
        return { reply: `I couldn’t find that book, ${name}. Try \`search title ...\`.` };
      }
      return {
        reply:
          res.fine.daysLate <= 0
            ? `No fine right now for “${res.book.title}”.`
            : `Current fine for “${res.book.title}”: ₹${res.fine.fine} (${res.fine.daysLate} day(s) late).`,
        data: { book: res.book, loan: res.loan, fine: res.fine }
      };
    }
    case "UNKNOWN":
    default:
      return { reply: `I didn’t understand that, ${name}.\n\nYou’re in 📚 Library Management Mode — try:\n${helpText()}` };
  }
}

module.exports = { handleChat };

