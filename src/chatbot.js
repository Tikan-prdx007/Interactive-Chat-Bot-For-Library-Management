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

// ── Groq client ──────────────────────────────────────────────────────────────
const Groq = require("groq-sdk");

function groqKeyOk() {
  const k = process.env.GROQ_API_KEY;
  return k && k !== "your_groq_api_key_here";
}

let _groq = null;
function getGroq() {
  if (!_groq && groqKeyOk()) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

const SYSTEM_PROMPT = `You are an advanced multimodal AI assistant integrated into a platform called "BookFLow" for students at BPUT (Biju Patnaik University of Technology).

CORE OBJECTIVE:
Deliver clear, helpful, and natural responses that improve user understanding, feel conversational and human, and adapt dynamically to input style.

INTELLIGENCE & ADAPTATION:
1. Detect input style automatically:
   - Short, casual, or spoken-like → treat as VOICE INPUT → shorter, conversational responses
   - Structured or detailed → treat as TEXT INPUT → structured, detailed responses
2. Detect intent: Question / Concept explanation / Problem solving / Casual interaction

VOICE MODE (when input is short/casual/spoken):
- Natural speaking tone, sentences 8–15 words
- No heavy formatting or markdown symbols
- Use conversational fillers: "Okay, let's see...", "Here's the idea...", "Got it."
- Break explanations into small chunks

CHAT MODE (when input is structured/detailed):
- Bullet points, numbered steps, **bold** for key terms
- Structure: 1) Clear explanation 2) Example 3) Optional deeper insight
- Keep concise unless asked for more

CONTEXT AWARENESS:
- Remember recent conversation context, avoid repeating info, build on previous answers
- User is a university engineering student (Engineering, Maths, Programming, Exams)
- Voice input may contain errors/missing punctuation — interpret intent and respond clearly

UX-AWARE:
- Avoid overly long responses
- If input is unclear → ask a short clarifying question
- Suggest next steps when helpful

PERSONALITY: Friendly but professional. Helpful and patient. Slightly conversational.

RESTRICTIONS:
- Do NOT be robotic, overload with info, or go off-topic
- Do NOT use complex jargon unless necessary
- NEVER refuse to answer or redirect to another page
- Use **bold** for key terms

GOAL: Make the user feel — "This is fast, easy, and actually helpful."`;



/**
 * Send any message to Groq (llama3-8b-8192) via SDK.
 * Returns { reply } — never throws.
 */
async function askGroq(userMessage, studentName) {
  const groq = getGroq();
  if (!groq) {
    return localFallback(userMessage, studentName);
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 600,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    return { reply: text || "Sorry, I received an empty response. Please try again." };

  } catch (e) {
    console.error("[BookFLow] Groq error:", e?.status || e?.message || e);
    // 429 = rate limit / quota — fall back gracefully
    if (e?.status === 429) {
      return localFallback(userMessage, studentName, "⚠️ _AI is busy right now — using offline mode._\n\n");
    }
    // 401 = invalid key
    if (e?.status === 401) {
      return { reply: "❌ Invalid API key. Please check your `.env` file and restart the server." };
    }
    return localFallback(userMessage, studentName, "⚠️ _AI unavailable — offline mode._\n\n");
  }
}


/**
 * Local knowledge base — handles common academic & general queries
 * without needing internet or API credits.
 */
function localFallback(message, name, prefix = "") {
  const t = (message || "").toLowerCase();

  // ── Maths ──────────────────────────────────────────────────────────────────
  if (/trigonometry|sin|cos|tan|sine|cosine|tangent/.test(t)) {
    return { reply: prefix + "**Trigonometry** is the branch of mathematics that studies relationships between the sides and angles of triangles. The three primary functions are:\n\n- **sin(θ)** = opposite / hypotenuse\n- **cos(θ)** = adjacent / hypotenuse\n- **tan(θ)** = opposite / adjacent (= sin/cos)\n\nKey identity: **sin²θ + cos²θ = 1**. Trigonometry is widely used in physics, engineering, and computer graphics." };
  }
  if (/calculus|derivative|integration|integral|differential/.test(t)) {
    return { reply: prefix + "**Calculus** has two main branches:\n\n- **Differential Calculus**: studies rates of change using *derivatives*. The derivative of xⁿ is nxⁿ⁻¹.\n- **Integral Calculus**: studies accumulation of quantities using *integrals*.\n\nCommon rules: d/dx(sin x) = cos x, d/dx(eˣ) = eˣ. The Fundamental Theorem links differentiation and integration." };
  }
  if (/algebra|equation|polynomial|quadratic/.test(t)) {
    return { reply: prefix + "**Algebra** is the study of mathematical symbols and rules for manipulating them. Key concepts include variables, equations, and functions. The **quadratic formula** x = (−b ± √(b²−4ac)) / 2a solves ax²+bx+c = 0. Algebra is the foundation for all higher mathematics." };
  }
  if (/probability|statistics|mean|median|mode|variance|standard deviation/.test(t)) {
    return { reply: prefix + "**Statistics** key measures:\n\n- **Mean** = sum / count\n- **Median** = middle value when sorted\n- **Mode** = most frequent value\n- **Standard deviation** = √variance\n\n**Probability**: P(event) = favourable outcomes / total outcomes." };
  }
  if (/matrix|matrices|determinant|eigen/.test(t)) {
    return { reply: prefix + "A **Matrix** is a rectangular array of numbers. Key operations: addition, scalar multiplication, and matrix multiplication. The **determinant** of a 2×2 matrix [[a,b],[c,d]] = ad − bc. **Eigenvalues** (λ) satisfy det(A − λI) = 0 and are crucial in linear transformations, PCA, and quantum mechanics." };
  }

  // ── Data Structures & Algorithms ──────────────────────────────────────────
  if (/recursion|recursive/.test(t)) {
    return { reply: prefix + "**Recursion** is a technique where a function calls itself to solve smaller sub-problems. Two requirements:\n\n1. **Base case** — where it stops\n2. **Recursive case** — where it calls itself with a simpler input\n\nExample: `factorial(n) = n × factorial(n−1)`, base: `factorial(0) = 1`. Uses call-stack memory for each call." };
  }
  if (/linked list|linked-list/.test(t)) {
    return { reply: prefix + "A **Linked List** is a linear data structure of nodes, each containing data and a pointer to the next node. Types: **Singly** (one direction), **Doubly** (both directions), **Circular**. Insert/delete at head: O(1); search: O(n). Unlike arrays, nodes need not be in contiguous memory." };
  }
  if (/\bstack\b|lifo/.test(t)) {
    return { reply: prefix + "A **Stack** is a Last-In-First-Out (LIFO) data structure. Core operations (all O(1)): **push** (add to top), **pop** (remove from top), **peek** (view top). Used in: function call management, undo/redo, expression parsing, and DFS." };
  }
  if (/\bqueue\b|fifo/.test(t)) {
    return { reply: prefix + "A **Queue** is a First-In-First-Out (FIFO) data structure. Elements enter at the **rear** and leave from the **front**. Operations (all O(1)): **enqueue**, **dequeue**. Used in: task scheduling, BFS, printer spooling, and message buffers." };
  }
  if (/binary search|binary tree|bst/.test(t)) {
    return { reply: prefix + "A **Binary Search Tree (BST)** stores values such that left subtree < node < right subtree. Average-case search/insert/delete: O(log n). **Binary Search** on a sorted array also runs in O(log n) by halving the search range each step." };
  }
  if (/sort|bubble sort|merge sort|quick sort|heap sort/.test(t)) {
    return { reply: prefix + "**Sorting algorithm complexities:**\n\n| Algorithm | Avg | Worst | Space |\n|---|---|---|---|\n| Bubble Sort | O(n²) | O(n²) | O(1) |\n| Merge Sort | O(n log n) | O(n log n) | O(n) |\n| Quick Sort | O(n log n) | O(n²) | O(log n) |\n| Heap Sort | O(n log n) | O(n log n) | O(1) |" };
  }
  if (/\bgraph\b|bfs|dfs|breadth.first|depth.first/.test(t)) {
    return { reply: prefix + "**Graph traversal:**\n\n- **BFS** (Breadth-First Search): uses a queue, explores level by level, finds shortest path in unweighted graphs. O(V+E).\n- **DFS** (Depth-First Search): uses a stack/recursion, explores depth-first, used for cycle detection and topological sort. O(V+E)." };
  }
  if (/dynamic programming|dp|memoization/.test(t)) {
    return { reply: prefix + "**Dynamic Programming (DP)** solves complex problems by breaking them into overlapping sub-problems and storing results to avoid recomputation. Two approaches:\n\n- **Memoization** (top-down): recursion + cache\n- **Tabulation** (bottom-up): iterative table fill\n\nClassic problems: Fibonacci, Knapsack, Longest Common Subsequence." };
  }

  // ── OOP & Systems ─────────────────────────────────────────────────────────
  if (/oop|object.oriented|class|inheritance|polymorphism|encapsulation|abstraction/.test(t)) {
    return { reply: prefix + "**OOP Four Pillars:**\n\n1. **Encapsulation** — bundle data & methods, hide internal state\n2. **Inheritance** — child class inherits from parent\n3. **Polymorphism** — same interface, different implementations\n4. **Abstraction** — hide complexity, expose essentials" };
  }
  if (/pointer|malloc|heap memory/.test(t)) {
    return { reply: prefix + "**Pointers** store memory addresses. In C: `int *p = &x;`. **Stack memory** is auto-managed (local variables). **Heap memory** is manual: `malloc`/`free` in C, `new`/`delete` in C++. Forgetting to free heap memory causes **memory leaks**." };
  }
  if (/operating system|\bos\b|process|thread|deadlock|semaphore|scheduling/.test(t)) {
    return { reply: prefix + "**OS key concepts:**\n\n- **Process**: running program instance\n- **Thread**: lightweight unit within a process\n- **Deadlock**: circular wait between processes\n- **Semaphore**: synchronisation primitive\n- **Scheduling**: FCFS, Round Robin, SJF, Priority" };
  }
  if (/database|sql|dbms|normali[sz]ation|\bjoin\b/.test(t)) {
    return { reply: prefix + "**DBMS key concepts:**\n\n- **SQL**: SELECT, INSERT, UPDATE, DELETE\n- **Normalization**: 1NF → 2NF → 3NF → BCNF (reduce redundancy)\n- **JOIN types**: INNER, LEFT, RIGHT, FULL\n- **ACID**: Atomicity, Consistency, Isolation, Durability" };
  }
  if (/network|tcp|udp|\bip\b|http|osi model|protocol/.test(t)) {
    return { reply: prefix + "**Computer Networks:**\n\n- **OSI Model**: 7 layers — Physical, Data Link, Network, Transport, Session, Presentation, Application\n- **TCP**: reliable, ordered (3-way handshake)\n- **UDP**: fast, unreliable — used for streaming/gaming\n- **HTTP/HTTPS**: Application-layer web protocol" };
  }
  if (/compiler|interpreter|lexer|parser|assembler/.test(t)) {
    return { reply: prefix + "A **Compiler** translates the entire source code into machine code before execution (C, C++). An **Interpreter** executes code line-by-line (Python, JS). Compilation phases: **Lexical Analysis → Parsing → Semantic Analysis → Code Generation → Optimization**." };
  }

  // ── General ───────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(t)) {
    return { reply: prefix + `Hello, ${name}! 👋 I'm **BookFLow**, your academic and library assistant. Ask me anything:\n\n📚 Library: \`search title Clean Code\`, \`reserve 3\`, \`availability 1\`\n🧠 Topics: maths, CS, networks, databases, OOP...\n💡 Study tips, book recommendations\n\nWhat would you like to know?` };
  }
  if (/who are you|what are you|your name|what can you do/.test(t)) {
    return { reply: prefix + `I'm **BookFLow** 🤖 — your AI academic and library assistant at BPUT.\n\n- 📚 Search, reserve & issue books from the library\n- 🧠 Explain academic topics (maths, CS, science, engineering)\n- 💡 Give study tips and book recommendations\n- 📊 Show your study dashboard\n\nJust ask me anything!` };
  }
  if (/study tip|how to study|focus|concentrate|exam|time management/.test(t)) {
    return { reply: prefix + "**Study tips** 📚\n\n1. **Pomodoro Technique**: 25 min focus → 5 min break\n2. **Active recall**: test yourself, don't just re-read\n3. **Spaced repetition**: review at increasing intervals\n4. **Feynman Technique**: explain it simply in your own words\n5. **Sleep**: memory consolidates during sleep — prioritise it\n6. **Mind maps**: connect concepts visually" };
  }
  if (/recommend|suggest book|best book/.test(t)) {
    return { reply: prefix + "📚 **Top books for engineering students:**\n\n**CS/Programming:**\n- *Introduction to Algorithms* — Cormen et al.\n- *Clean Code* — Robert Martin\n- *The Pragmatic Programmer* — Hunt & Thomas\n\n**Maths:** *Higher Engineering Mathematics* — B.S. Grewal\n\n**Productivity:** *Deep Work* — Cal Newport\n\nSearch the library: \`search title Clean Code\`" };
  }

  // ── Default ───────────────────────────────────────────────────────────────
  return {
    reply: prefix + `I'm BookFLow, ${name}! 🤖 Ask me about:\n\n🧠 **Topics**: trigonometry, recursion, sorting, OOP, databases, networks, OS, compilers, DP\n📚 **Library**: \`search title <book>\`, \`availability <id>\`, \`reserve <id>\`\n💡 **Study tips** — just ask "how to study"`
  };
}

// ── Library helpers ───────────────────────────────────────────────────────────

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
    "- availability 3",
    "- reserve 3",
    "- issue 3",
    "- return 3",
    "- due 3",
    "- fine 3",
    "- dashboard"
  ].join("\n");
}

function parseMessage(message) {
  const m = clean(message);
  const lower = m.toLowerCase();

  if (!m) return { intent: "UNKNOWN" };

  if (["hi", "hello", "hey", "start"].includes(lower)) return { intent: "UNKNOWN" }; // let AI handle greetings
  if (["help", "/help", "h"].includes(lower)) return { intent: "HELP" };
  if (["timings", "hours", "time"].includes(lower)) return { intent: "UNKNOWN" };
  if (["rules", "policy", "policies"].includes(lower)) return { intent: "UNKNOWN" };
  if (["dashboard", "progress", "my progress", "study dashboard", "analytics"].includes(lower)) {
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

  // ── All conversational / unknown → Groq AI ─────────────────────────────
  if (parsed.intent === "UNKNOWN") {
    return await askGroq(clean(message) || "Hello", name);
  }

  if (parsed.intent === "HELP") {
    return await askGroq(`The user asked for help. Respond as BookFLow listing useful library commands: ${helpText()}`, name);
  }

  // ── Structured library commands → SQLite ─────────────────────────────────
  switch (parsed.intent) {
    case "DASHBOARD": {
      const studyHours = (await getMemberContext(db, { memberId, key: "studyHoursThisWeek" }).catch(() => null)) ?? 8;
      const topicsCovered = (await getMemberContext(db, { memberId, key: "topicsCovered" }).catch(() => null)) ?? 4;
      const avgQuiz = (await getMemberContext(db, { memberId, key: "avgQuizScore" }).catch(() => null)) ?? 78;
      const strongest = (await getMemberContext(db, { memberId, key: "strongestSubject" }).catch(() => null)) ?? "Data Structure";
      const needsImprovement = (await getMemberContext(db, { memberId, key: "needsImprovement" }).catch(() => null)) ?? "Mathematics";
      const readingStreak = (await getMemberContext(db, { memberId, key: "readingStreakDays" }).catch(() => null)) ?? 3;

      return {
        reply:
          `📊 **Your Study Snapshot**\n\n` +
          `📅 Study Hours This Week: **${studyHours} hrs**\n` +
          `📖 Topics Covered: **${topicsCovered}**\n` +
          `🎯 Average Quiz Score: **${avgQuiz}%**\n` +
          `💪 Strongest Subject: **${strongest}**\n` +
          `📈 Needs Improvement: **${needsImprovement}**\n` +
          `🔥 Reading Streak: **${readingStreak} day(s)**\n\n` +
          `Keep it up, ${name}! Spend 20 focused minutes on **${needsImprovement}** today.`
      };
    }
    case "SEARCH": {
      const args =
        parsed.field === "title" ? { title: parsed.query } :
        parsed.field === "author" ? { author: parsed.query } :
        { category: parsed.query };
      const books = await searchBooks(db, args);
      if (!books.length) {
        return { reply: `No books found for that search, ${name}.\n\nTry:\n- \`search title <broader keyword>\`\n- \`search category Programming\`` };
      }
      return {
        reply: `${formatBooks(books)}\n\nNext:\n- \`availability ${books[0].id}\`\n- \`reserve ${books[0].id}\``,
        data: { books }
      };
    }
    case "AVAILABILITY": {
      const res = await checkAvailability(db, { bookId: parsed.bookId ?? null, title: parsed.title ?? null });
      if (!res.ok) return { reply: `Couldn't find that book, ${name}. Try \`search title ...\`.` };
      const avail = res.available
        ? `✅ "${res.book.title}" is **available** — Shelf: ${res.book.shelf_location || "—"}`
        : `⏳ "${res.book.title}" is **currently unavailable**.`;
      return {
        reply: `${avail}\nCopies: ${res.book.available_copies}/${res.book.total_copies}\n\n` +
          (res.available ? `Issue it: \`issue ${res.book.id}\`\nReserve it: \`reserve ${res.book.id}\`` : `Reserve a spot: \`reserve ${res.book.id}\``),
        data: { book: res.book }
      };
    }
    case "RESERVE": {
      const res = await reserveBook(db, { memberId, bookId: parsed.bookId ?? null, title: parsed.title ?? null });
      if (!res.ok) return { reply: `Couldn't find that book. Try \`search title ...\`.` };
      return {
        reply: `${res.alreadyReserved ? "Already reserved ✅" : "Reserved ✅"}, ${name}!\n\n📌 "${res.book.title}" — Shelf: ${res.book.shelf_location || "—"}\nQueue position: ${res.queue.position}/${res.queue.total}`,
        data: { book: res.book }
      };
    }
    case "SIMILAR": {
      const res = await suggestSimilar(db, { bookId: parsed.bookId ?? null, title: parsed.title ?? null, limit: 5 });
      if (!res.ok) return { reply: `Couldn't find that book. Try \`search title ...\`.` };
      if (!res.suggestions.length) return { reply: `No similar books found yet. Try \`search category ${res.book.category}\`.` };
      return {
        reply: `📌 Similar to "${res.book.title}":\n\n` + res.suggestions.map(b => `- [${b.id}] ${b.title} — ${b.author}`).join("\n") + `\n\nReserve one: \`reserve ${res.suggestions[0].id}\``,
        data: { book: res.book, suggestions: res.suggestions }
      };
    }
    case "ISSUE": {
      const res = await issueBook(db, { memberId, bookId: parsed.bookId ?? null, title: parsed.title ?? null, loanDays: 14 });
      if (!res.ok) {
        if (res.reason === "NOT_AVAILABLE") return { reply: `"${res.book.title}" isn't available right now. Want to reserve it?\n- \`reserve ${res.book.id}\`` };
        if (res.reason === "RESERVED_FOR_OTHER") return { reply: `That copy is reserved for another student. Join the queue:\n- \`reserve ${res.book.id}\`` };
        return { reply: `Couldn't find that book. Try \`search title ...\`.` };
      }
      return {
        reply: `✅ Issued "${res.book.title}", ${name}!\n📅 Due: ${new Date(res.loan.due_at).toLocaleString()}\n📍 Shelf: ${res.book.shelf_location || "—"}\n\nReturn: \`return ${res.book.id}\``,
        data: { book: res.book, loan: res.loan }
      };
    }
    case "RETURN": {
      const res = await returnBook(db, { memberId, bookId: parsed.bookId ?? null, title: parsed.title ?? null });
      if (!res.ok) {
        if (res.reason === "NO_ACTIVE_LOAN") return { reply: `No active loan found for that book.` };
        return { reply: `Couldn't find that book. Try \`search title ...\`.` };
      }
      return {
        reply: `✅ Returned "${res.book.title}". Thanks, ${name}!\n\nSimilar picks: \`similar ${res.book.id}\``,
        data: { book: res.book }
      };
    }
    case "DUE": {
      const res = await dueDate(db, { memberId, bookId: parsed.bookId ?? null, title: parsed.title ?? null });
      if (!res.ok) return { reply: res.reason === "NO_ACTIVE_LOAN" ? `No active loan for that book.` : `Couldn't find that book.` };
      return {
        reply: `📅 "${res.book.title}" due: **${new Date(res.loan.due_at).toLocaleString()}**\n\nReturn: \`return ${res.book.id}\``,
        data: { book: res.book, loan: res.loan }
      };
    }
    case "FINE": {
      const res = await fineForLoan(db, { memberId, bookId: parsed.bookId ?? null, title: parsed.title ?? null, finePerDay: 5 });
      if (!res.ok) return { reply: `No active loan found for that book.` };
      return {
        reply: res.fine.daysLate <= 0
          ? `No fine for "${res.book.title}" — you're on time! ✅`
          : `💸 Fine for "${res.book.title}": ₹${res.fine.fine} (${res.fine.daysLate} day(s) late)`,
        data: { book: res.book, fine: res.fine }
      };
    }
    default:
      return await askGroq(clean(message) || "Hello", name);
  }
}

module.exports = { handleChat };
