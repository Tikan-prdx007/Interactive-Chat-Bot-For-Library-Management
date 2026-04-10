// ─── BookFlow Seed Data ───────────────────────────────────────────────────────

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
  quizTotal: 0,       // total quizzes ever attempted
  quizCorrect: 0,     // total correct answers ever
  quizQuestions: 0,   // total questions ever answered
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
  subjectAccuracy: {}, // { "Mathematics": { correct: 3, total: 5 }, ... }
  weeklyHours: [2, 3, 1.5, 2.5, 3, 0, 0], // Mon–Sun
  activityLog: [],    // [{ date: "2026-04-10", studyMins: 45 }]
  recentTopics: ["Queues (FIFO)", "Binary Search", "Recursion"],
  issuedBooks: [],
  quizHistory: [],    // [{ subject, score, total, accuracy, date, xpEarned }]
  dailyGoals: {
    studyMins: 30,
    quizCount: 2,
    studyDone: 0,
    quizDone: 0,
    lastGoalDate: null,
  },
};


const BADGES_CONFIG = [
  { id: "bookworm",        emoji: "📚", name: "Bookworm",        desc: "Issued your first book",           xp: 50  },
  { id: "quick_learner",   emoji: "⚡", name: "Quick Learner",   desc: "Scored 80%+ on a quiz",            xp: 75  },
  { id: "focused_learner", emoji: "🎯", name: "Focused Learner", desc: "Studied 5 days in a row",          xp: 100 },
  { id: "quiz_ace",        emoji: "🏆", name: "Quiz Ace",        desc: "Perfect score on any quiz",        xp: 150 },
  { id: "scholar",         emoji: "🎓", name: "Scholar",         desc: "Covered 15+ topics",               xp: 200 },
  { id: "night_owl",       emoji: "🦉", name: "Night Owl",       desc: "Studied after 10 PM",              xp: 50  },
  { id: "speed_reader",    emoji: "💨", name: "Speed Reader",    desc: "Returned a book within 3 days",    xp: 75  },
  { id: "master_mind",     emoji: "🧠", name: "Master Mind",     desc: "Reached XP level 1000+",           xp: 300 },
  { id: "first_quiz",      emoji: "🎉", name: "First Quiz",      desc: "Completed your very first quiz",   xp: 50  },
  { id: "streak_3",        emoji: "🔥", name: "3-Day Streak",    desc: "Studied 3 days in a row",          xp: 75  },
  { id: "accuracy_ace",    emoji: "🎯", name: "Accuracy Ace",    desc: "Scored 90%+ on a quiz",            xp: 100 },
  { id: "daily_hero",      emoji: "🦸", name: "Daily Hero",      desc: "Completed all daily goals",        xp: 150 },
];

const LEVELS = [
  { name: "Beginner",  minXP: 0    },
  { name: "Learner",   minXP: 200  },
  { name: "Scholar",   minXP: 500  },
  { name: "Master",    minXP: 1000 },
  { name: "Champion",  minXP: 2000 },
  { name: "Legend",    minXP: 3500 },
];

const CHAT_RESPONSES = {
  greet: ["Hey there, {name}! 👋 How can I help you today? Ask me about books, your progress, or any topic!", "Welcome back, {name}! 😊 Ready to learn something new today?"],
  library: ["Let me search the library for you, {name}! 📚", "Sure! I'll check book availability right away."],
  dashboard: ["Here's a snapshot of your academic progress, {name}! 📊", "Let me pull up your study stats!"],
  motivate: ["You're doing amazing, {name}! Keep going! 🚀", "Every hour of study brings you closer to your goals! 💪"],
  unknown: ["That's an interesting question! Could you clarify — are you asking about a book, a topic, or your progress?", "I'm not sure I understood that. Try asking about a book, a topic, or your dashboard!"],
};

// ── Fallback Quiz Question Bank ───────────────────────────────────────────────
const QUIZ_QUESTION_BANK = {
  "Academic": [
    { question: "What does OOP stand for?", options: ["Object-Oriented Programming","Open-Output Protocol","Operator-Ordered Process","Object-Output Platform"], correct: 0, explanation: "OOP stands for Object-Oriented Programming — a paradigm centered around objects combining data and behavior." },
    { question: "Which data structure uses LIFO order?", options: ["Queue","Stack","Linked List","Tree"], correct: 1, explanation: "A Stack uses Last-In-First-Out (LIFO) — the last element pushed is the first to be popped." },
    { question: "What is the time complexity of Binary Search?", options: ["O(n)","O(n²)","O(log n)","O(1)"], correct: 2, explanation: "Binary Search runs in O(log n) because it halves the search space with every comparison." },
    { question: "Which of these is NOT a relational database?", options: ["MySQL","PostgreSQL","MongoDB","SQLite"], correct: 2, explanation: "MongoDB is a NoSQL document database; MySQL, PostgreSQL, and SQLite are relational (SQL) databases." },
    { question: "What does HTTP stand for?", options: ["HyperText Transfer Protocol","High-Tech Transfer Procedure","HyperText Terminal Protocol","Hosted Transfer Process"], correct: 0, explanation: "HTTP (HyperText Transfer Protocol) is the foundation of data communication on the World Wide Web." },
    { question: "Which sorting algorithm has the best average-case complexity?", options: ["Bubble Sort","Insertion Sort","Merge Sort","Selection Sort"], correct: 2, explanation: "Merge Sort has O(n log n) average-case complexity, which is optimal for comparison-based sorting." },
    { question: "In Python, which keyword is used to define a function?", options: ["function","define","def","func"], correct: 2, explanation: "In Python, the `def` keyword is used to define a function: `def my_function():`." },
    { question: "What is the main purpose of an Operating System?", options: ["Browse the internet","Manage hardware and software resources","Run antivirus","Compile code"], correct: 1, explanation: "An OS manages hardware and software resources, providing services to programs and users." },
    { question: "Which OSI layer is responsible for routing?", options: ["Data Link","Transport","Network","Session"], correct: 2, explanation: "The Network layer (Layer 3) is responsible for logical addressing and routing packets across networks." },
    { question: "What does SQL stand for?", options: ["Structured Query Language","Simple Question Language","Syntax Query Logic","Standard Query List"], correct: 0, explanation: "SQL stands for Structured Query Language, used to manage and query relational databases." },
    { question: "Which concept in OOP allows a class to inherit from multiple classes?", options: ["Encapsulation","Multiple Inheritance","Polymorphism","Abstraction"], correct: 1, explanation: "Multiple Inheritance allows a class to inherit features from more than one parent class." },
    { question: "What is the base case in recursion?", options: ["The first recursive call","The condition that stops recursion","The return value","The loop inside the function"], correct: 1, explanation: "The base case is the condition that terminates the recursion, preventing infinite loops." },
    { question: "Which data structure is used for BFS traversal?", options: ["Stack","Queue","Priority Queue","Array"], correct: 1, explanation: "BFS uses a Queue (FIFO) to explore nodes level by level in a graph or tree." },
    { question: "What is Normalization in databases?", options: ["Encrypting data","Removing redundancy and dependency","Compressing data","Backing up data"], correct: 1, explanation: "Normalization is the process of organizing database tables to reduce redundancy and improve data integrity." },
    { question: "Which protocol is used for secure web communication?", options: ["HTTP","FTP","HTTPS","SMTP"], correct: 2, explanation: "HTTPS (HTTP Secure) uses SSL/TLS encryption to secure data transmitted between browsers and servers." },
    { question: "What does a compiler do?", options: ["Runs code line by line","Converts source code to machine code","Debugs programs","Manages memory"], correct: 1, explanation: "A compiler translates entire source code into machine code (executable) before running." },
    { question: "Which of these is a dynamic programming problem?", options: ["Binary Search","Fibonacci Sequence","Linear Search","Bubble Sort"], correct: 1, explanation: "Fibonacci Sequence is a classic DP problem — overlapping subproblems can be solved and cached." },
    { question: "What is a primary key in a database?", options: ["A key to login","A unique identifier for each record","A foreign table reference","An encrypted field"], correct: 1, explanation: "A primary key uniquely identifies each record in a table and must be unique and non-null." },
  ],
  "Books": [
    { question: "Who authored 'Introduction to Algorithms' (CLRS)?", options: ["Donald Knuth","Cormen, Leiserson, Rivest & Stein","Andrew Tanenbaum","Robert Martin"], correct: 1, explanation: "CLRS stands for the four authors: Cormen, Leiserson, Rivest, and Stein — a standard algorithms textbook." },
    { question: "What is the main topic of 'Clean Code' by Robert C. Martin?", options: ["Database design","Writing readable and maintainable code","Machine learning","Network security"], correct: 1, explanation: "Clean Code focuses on software craftsmanship — writing code that is easy to read, understand, and maintain." },
    { question: "Which book is subtitled 'The Pragmatic Programmer'?", options: ["Code Complete","The Pragmatic Programmer: Your Journey to Mastery","The Art of Computer Programming","Design Patterns"], correct: 1, explanation: "The full title is 'The Pragmatic Programmer: Your Journey to Mastery' by Andrew Hunt and David Thomas." },
    { question: "Who wrote 'The Art of Computer Programming'?", options: ["Donald Knuth","Edsger Dijkstra","Alan Turing","Charles Babbage"], correct: 0, explanation: "Donald Knuth is the author of this multivolume work, considered one of the finest computer science texts." },
    { question: "What design pattern does 'Design Patterns: GoF' primarily cover?", options: ["Functional patterns","Software reuse patterns","Hardware patterns","Network patterns"], correct: 1, explanation: "The Gang of Four book covers 23 classic software design patterns for object-oriented programming." },
    { question: "Which book teaches Python from scratch for beginners?", options: ["Python Crash Course","Python Cookbook","Fluent Python","High Performance Python"], correct: 0, explanation: "Python Crash Course by Eric Matthes is a beginner-friendly introduction to Python programming." },
    { question: "Head First Java is published by which publisher?", options: ["Addison-Wesley","O'Reilly Media","McGraw-Hill","Pearson"], correct: 1, explanation: "Head First Java is published by O'Reilly Media, part of the popular 'Head First' learning series." },
    { question: "What is the Dewey Decimal Classification used for?", options: ["Cataloguing books in libraries","Encrypting library data","Rating book quality","Managing member records"], correct: 0, explanation: "The Dewey Decimal System is a library classification system that assigns numerical codes to organize books by subject." },
    { question: "Which book is known as 'the dragon book' in CS?", options: ["Algorithms by CLRS","Compilers: Principles, Techniques & Tools","Code by Petzold","The C Programming Language"], correct: 1, explanation: "'Compilers: Principles, Techniques & Tools' by Aho, Lam, Sethi & Ullman is called the Dragon Book due to its cover art." },
    { question: "Who wrote 'Artificial Intelligence: A Modern Approach'?", options: ["Andrew Ng","Geoffrey Hinton","Russell & Norvig","Yann LeCun"], correct: 2, explanation: "Russell and Norvig wrote this definitive AI textbook, the most widely used in AI courses worldwide." },
    { question: "What is an ISBN?", options: ["International Standard Book Number","Indexed Search Book Name","Internal Storage Binary Node","Integrated System Book Network"], correct: 0, explanation: "ISBN stands for International Standard Book Number — a unique numeric identifier for books." },
    { question: "Which book covers machine learning by Andrew Ng?", options: ["Deep Learning","Machine Learning Yearning","Pattern Recognition","AI Superpowers"], correct: 1, explanation: "Machine Learning Yearning by Andrew Ng focuses on structuring ML projects and diagnosing errors." },
  ],
  "General Knowledge": [
    { question: "What does AI stand for?", options: ["Automated Integration","Artificial Intelligence","Advanced Interface","Algorithmic Input"], correct: 1, explanation: "AI stands for Artificial Intelligence — the simulation of human intelligence in machines." },
    { question: "Which country invented the World Wide Web?", options: ["USA","Germany","UK","Japan"], correct: 2, explanation: "The WWW was invented by British scientist Tim Berners-Lee in 1989 while working at CERN, Switzerland (though he's British)." },
    { question: "What year was the first iPhone released?", options: ["2005","2006","2007","2008"], correct: 2, explanation: "Apple released the first iPhone on June 29, 2007, revolutionizing the smartphone industry." },
    { question: "What does CPU stand for?", options: ["Central Processing Unit","Computer Power Unit","Core Program Utility","Central Program Uploader"], correct: 0, explanation: "CPU stands for Central Processing Unit — the primary component that executes instructions in a computer." },
    { question: "Which company developed the Android operating system?", options: ["Apple","Microsoft","Google","Samsung"], correct: 2, explanation: "Android was developed by Android Inc., which Google acquired in 2005. Google now leads Android development." },
    { question: "What is the full form of RAM?", options: ["Random Access Memory","Read Active Module","Run Anywhere Memory","Rapid Application Method"], correct: 0, explanation: "RAM stands for Random Access Memory — volatile memory used by computers to store currently running programs." },
    { question: "Who founded Microsoft?", options: ["Steve Jobs","Elon Musk","Bill Gates and Paul Allen","Mark Zuckerberg"], correct: 2, explanation: "Microsoft was founded by Bill Gates and Paul Allen on April 4, 1975." },
    { question: "What does 'www' stand for in a website URL?", options: ["World Wide Web","Wide Wireless Web","World Web Worldwide","Web and Wire Works"], correct: 0, explanation: "WWW stands for World Wide Web, a system of interlinked hypertext documents accessible via the Internet." },
    { question: "Which planet is known as the Red Planet?", options: ["Venus","Jupiter","Mars","Saturn"], correct: 2, explanation: "Mars is called the Red Planet because of its reddish appearance caused by iron oxide (rust) on its surface." },
    { question: "What is the speed of light in a vacuum?", options: ["3×10⁸ m/s","3×10⁶ m/s","3×10¹⁰ m/s","3×10⁴ m/s"], correct: 0, explanation: "The speed of light in a vacuum is approximately 3×10⁸ meters per second (299,792,458 m/s)." },
    { question: "Which programming language is known as the 'mother of all languages'?", options: ["Fortran","C","Assembly","COBOL"], correct: 1, explanation: "C is often called the 'mother of all languages' because many modern languages (C++, Java, Python) are influenced by it." },
    { question: "What does GPS stand for?", options: ["Global Positioning System", "General Purpose Satellite", "Geographic Position Sensor", "Ground Positioning System"], correct: 0, explanation: "GPS stands for Global Positioning System — a satellite-based navigation system providing location and time information." },
    { question: "Which element has the chemical symbol 'Au'?", options: ["Silver","Gold","Aluminum","Argon"], correct: 1, explanation: "Au is the chemical symbol for Gold, derived from the Latin word 'Aurum'." },
    { question: "How many bits are in one byte?", options: ["4","16","8","32"], correct: 2, explanation: "One byte consists of 8 bits. A bit is the smallest unit of data, representing either 0 or 1." },
    { question: "What is the full form of URL?", options: ["Uniform Resource Locator","User Record Link","Unified Routing Logic","Universal Resource Layer"], correct: 0, explanation: "URL stands for Uniform Resource Locator — the full web address used to locate resources on the internet." },
    { question: "Who invented the telephone?", options: ["Nikola Tesla","Thomas Edison","Alexander Graham Bell","Guglielmo Marconi"], correct: 2, explanation: "Alexander Graham Bell is credited with inventing and patenting the first practical telephone in 1876." },
    { question: "What does IoT stand for?", options: ["Internet of Things","Integration of Technology","Input-Output Terminal","Internal Operation Tool"], correct: 0, explanation: "IoT stands for Internet of Things — a network of physical devices embedded with sensors connected to the internet." },
    { question: "Which country is the largest producer of coffee in the world?", options: ["Colombia","Vietnam","Ethiopia","Brazil"], correct: 3, explanation: "Brazil is the world's largest coffee producer, accounting for about one-third of global coffee production." },
  ],
};



