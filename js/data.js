// ─── LibraMate Seed Data ─────────────────────────────────────────────────────

const LIBRARY_BOOKS = [
  { id: 1,  title: "Data Structures Made Easy",      author: "Narasimha Karumanchi", subject: "Data Structures", shelf: "B2", emoji: "📘", available: true,  dueDate: null },
  { id: 2,  title: "Introduction to Algorithms",     author: "CLRS",                 subject: "Algorithms",      shelf: "B3", emoji: "📗", available: false, dueDate: "2026-03-10" },
  { id: 3,  title: "Clean Code",                     author: "Robert C. Martin",     subject: "Programming",     shelf: "A4", emoji: "📙", available: true,  dueDate: null },
  { id: 4,  title: "Design Patterns",                author: "Gang of Four",         subject: "OOP",             shelf: "C1", emoji: "📕", available: true,  dueDate: null },
  { id: 5,  title: "The Pragmatic Programmer",       author: "Hunt & Thomas",        subject: "Programming",     shelf: "A5", emoji: "📓", available: false, dueDate: "2026-03-08" },
  { id: 6,  title: "Computer Networks",              author: "Tanenbaum",            subject: "Networks",        shelf: "D2", emoji: "📒", available: true,  dueDate: null },
  { id: 7,  title: "Operating System Concepts",      author: "Silberschatz",         subject: "OS",              shelf: "D4", emoji: "📔", available: true,  dueDate: null },
  { id: 8,  title: "Database System Concepts",       author: "Korth",                subject: "DBMS",            shelf: "E1", emoji: "📚", available: false, dueDate: "2026-03-15" },
  { id: 9,  title: "Artificial Intelligence",        author: "Russell & Norvig",     subject: "AI",              shelf: "F3", emoji: "🤖", available: true,  dueDate: null },
  { id: 10, title: "Python Crash Course",            author: "Eric Matthes",         subject: "Python",          shelf: "A1", emoji: "🐍", available: true,  dueDate: null },
  { id: 11, title: "JavaScript: The Good Parts",     author: "Douglas Crockford",    subject: "JavaScript",      shelf: "A2", emoji: "⚡", available: true,  dueDate: null },
  { id: 12, title: "Head First Java",                author: "Kathy Sierra",         subject: "Java",            shelf: "A3", emoji: "☕", available: false, dueDate: "2026-03-12" },
  { id: 13, title: "Cracking the Coding Interview",  author: "Gayle McDowell",       subject: "Algorithms",      shelf: "B4", emoji: "💡", available: true,  dueDate: null },
  { id: 14, title: "Machine Learning Yearning",      author: "Andrew Ng",            subject: "ML",              shelf: "F4", emoji: "🧠", available: true,  dueDate: null },
  { id: 15, title: "Deep Learning",                  author: "Goodfellow et al.",    subject: "ML",              shelf: "F5", emoji: "🔬", available: true,  dueDate: null },
  { id: 16, title: "Discrete Mathematics",           author: "Kenneth Rosen",        subject: "Mathematics",     shelf: "G1", emoji: "📐", available: true,  dueDate: null },
  { id: 17, title: "Computer Organization",          author: "Carl Hamacher",        subject: "CO",              shelf: "D1", emoji: "💾", available: false, dueDate: "2026-03-20" },
  { id: 18, title: "Software Engineering",           author: "Ian Sommerville",      subject: "SE",              shelf: "C3", emoji: "🛠️", available: true,  dueDate: null },
  { id: 19, title: "Linear Algebra Done Right",      author: "Sheldon Axler",        subject: "Mathematics",     shelf: "G2", emoji: "📏", available: true,  dueDate: null },
  { id: 20, title: "Theory of Computation",          author: "Sipser",               subject: "TOC",             shelf: "E4", emoji: "🔣", available: true,  dueDate: null },
  { id: 21, title: "Calculus: Early Transcendentals",author: "James Stewart",        subject: "Mathematics",     shelf: "G3", emoji: "∫",  available: false, dueDate: "2026-03-18" },
  { id: 22, title: "Compilers: Principles",          author: "Dragon Book",          subject: "Compilers",       shelf: "E3", emoji: "🐉", available: true,  dueDate: null },
  { id: 23, title: "C Programming Language",         author: "Kernighan & Ritchie",  subject: "C",               shelf: "A6", emoji: "🔧", available: true,  dueDate: null },
  { id: 24, title: "The Art of Computer Programming",author: "Donald Knuth",         subject: "Algorithms",      shelf: "B1", emoji: "🎨", available: false, dueDate: "2026-03-25" },
  { id: 25, title: "Introduction to Machine Learning",author: "Alpaydin",            subject: "ML",              shelf: "F6", emoji: "🤖", available: true,  dueDate: null },
  { id: 26, title: "Web Development with Node.js",   author: "Shelley Powers",       subject: "Web",             shelf: "C4", emoji: "🌐", available: true,  dueDate: null },
  { id: 27, title: "React Up and Running",           author: "Stoyan Stefanov",      subject: "Web",             shelf: "C5", emoji: "⚛️", available: true,  dueDate: null },
  { id: 28, title: "Probability and Statistics",     author: "Papoulis",             subject: "Mathematics",     shelf: "G4", emoji: "📊", available: true,  dueDate: null },
  { id: 29, title: "Cybersecurity Essentials",       author: "Carter",               subject: "Security",        shelf: "H1", emoji: "🔒", available: true,  dueDate: null },
  { id: 30, title: "Cloud Computing: Concepts",      author: "Thomas Erl",           subject: "Cloud",           shelf: "H2", emoji: "☁️", available: true,  dueDate: null },
];

const DEFAULT_STUDENT = {
  name: "Aarav",
  avatar: "👨‍🎓",
  level: "Scholar",
  xp: 720,
  studyHoursWeek: 12,
  studyHoursTotal: 84,
  topicsCovered: 18,
  quizAvg: 78,
  streak: 5,
  lastLogin: null,
  badges: ["📚 Bookworm", "🎯 Focused Learner"],
  subjectScores: {
    "Programming":     88,
    "Data Structures": 75,
    "Algorithms":      70,
    "Mathematics":     58,
    "Networks":        65,
    "OS":              72,
    "DBMS":            60,
    "AI/ML":           80,
  },
  weeklyHours: [2, 3, 1.5, 2.5, 3, 0, 0], // Mon–Sun
  recentTopics: ["Queues (FIFO)", "Binary Search", "Recursion"],
  issuedBooks: [],
};



const BADGES_CONFIG = [
  { id: "bookworm",        emoji: "📚", name: "Bookworm",        desc: "Issued your first book",          xp: 50  },
  { id: "quick_learner",   emoji: "⚡", name: "Quick Learner",   desc: "Scored 80%+ on a quiz",           xp: 75  },
  { id: "focused_learner", emoji: "🎯", name: "Focused Learner", desc: "Studied 5 days in a row",         xp: 100 },
  { id: "quiz_ace",        emoji: "🏆", name: "Quiz Ace",        desc: "Perfect score on any quiz",        xp: 150 },
  { id: "scholar",         emoji: "🎓", name: "Scholar",         desc: "Covered 15+ topics",               xp: 200 },
  { id: "night_owl",       emoji: "🦉", name: "Night Owl",       desc: "Studied after 10 PM",              xp: 50  },
  { id: "speed_reader",    emoji: "💨", name: "Speed Reader",    desc: "Returned a book within 3 days",   xp: 75  },
  { id: "master_mind",     emoji: "🧠", name: "Master Mind",     desc: "Reached XP level 1000+",          xp: 300 },
];

const LEVELS = [
  { name: "Beginner",  minXP: 0    },
  { name: "Learner",   minXP: 200  },
  { name: "Scholar",   minXP: 500  },
  { name: "Master",    minXP: 1000 },
];

const CHAT_RESPONSES = {
  greet: ["Hey there, {name}! 👋 How can I help you today? Ask me about books, your progress, or any topic!", "Welcome back, {name}! 😊 Ready to learn something new today?"],
  library: ["Let me search the library for you, {name}! 📚", "Sure! I'll check book availability right away."],
  dashboard: ["Here's a snapshot of your academic progress, {name}! 📊", "Let me pull up your study stats!"],

  motivate: ["You're doing amazing, {name}! Keep going! 🚀", "Every hour of study brings you closer to your goals! 💪"],
  unknown: ["That's an interesting question! Could you clarify — are you asking about a book, a topic, or your progress?", "I'm not sure I understood that. Try asking about a book, a topic, or your dashboard!"],
};
