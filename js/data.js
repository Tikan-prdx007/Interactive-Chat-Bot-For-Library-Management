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

const TOPICS = {
  "Arrays": {
    simple: "An array is like a row of lockers — each locker holds one value and has a number (index) starting from 0.",
    technical: "An array is a contiguous block of memory storing elements of the same type. Access is O(1) by index, insertion/deletion at middle is O(n).",
    example: "fruits = ['Apple', 'Banana', 'Cherry'] — fruits[0] is 'Apple'.",
    code: `# Python Example\nfruits = ['Apple', 'Banana', 'Cherry']\nprint(fruits[1])  # Output: Banana`,
    quiz: [
      { q: "What is the time complexity of accessing an element in an array?", opts: ["O(n)", "O(1)", "O(log n)", "O(n²)"], ans: 1 },
      { q: "Arrays in Python are called?", opts: ["Tuples", "Dicts", "Lists", "Sets"], ans: 2 },
      { q: "What is the index of the first element?", opts: ["1", "-1", "0", "Depends"], ans: 2 },
    ]
  },
  "Stacks": {
    simple: "A stack is like a pile of plates — you can only add or remove from the TOP. This is called LIFO (Last In, First Out).",
    technical: "Stack is a linear data structure with push (add) and pop (remove) operations, both O(1). Used in function calls, undo operations, DFS.",
    example: "Browser back button — each page visited is pushed; pressing back pops the last page.",
    code: `# Python Example\nstack = []\nstack.append('Page1')  # push\nstack.append('Page2')  # push\nstack.pop()            # returns 'Page2'`,
    quiz: [
      { q: "Which principle does a Stack follow?", opts: ["FIFO", "LIFO", "FILO alternate", "Random"], ans: 1 },
      { q: "Which operation adds to a stack?", opts: ["pop", "enqueue", "push", "insert"], ans: 2 },
      { q: "Stack is used in which traversal?", opts: ["BFS", "DFS", "Both", "Neither"], ans: 1 },
    ]
  },
  "Queues": {
    simple: "A queue is like a line at a ticket counter — first person in line is served first. This is FIFO (First In, First Out).",
    technical: "Queue supports enqueue (add to rear) and dequeue (remove from front), both O(1) with a linked list. Used in BFS, task scheduling.",
    example: "Print spooler — first document sent to printer is printed first.",
    code: `# Python Example (deque)\nfrom collections import deque\nq = deque()\nq.append('Task1')   # enqueue\nq.append('Task2')   # enqueue\nq.popleft()         # returns 'Task1'`,
    quiz: [
      { q: "Which principle does a Queue follow?", opts: ["LIFO", "FIFO", "FILO", "Random"], ans: 1 },
      { q: "Queue is used in which graph traversal?", opts: ["DFS", "BFS", "Both", "Neither"], ans: 1 },
      { q: "Which end is used for insertion in a queue?", opts: ["Front", "Rear", "Both", "Middle"], ans: 1 },
    ]
  },
  "Recursion": {
    simple: "Recursion is a function that calls itself. Think of it like a mirror facing another mirror — infinite reflections, but we add a stopping condition.",
    technical: "Recursion solves problems by breaking them into subproblems of the same type. Requires a base case (stop condition) and recursive case. Each call uses the call stack.",
    example: "Calculating factorial: 5! = 5 × 4! = 5 × 4 × 3! ... until 1! = 1.",
    code: `# Python Example\ndef factorial(n):\n    if n == 1:       # base case\n        return 1\n    return n * factorial(n-1)  # recursive case\n\nprint(factorial(5))  # 120`,
    quiz: [
      { q: "What prevents recursion from running forever?", opts: ["Loop", "Base case", "Return", "Stack"], ans: 1 },
      { q: "What data structure does recursion internally use?", opts: ["Queue", "Array", "Stack", "Heap"], ans: 2 },
      { q: "Factorial of 0 is?", opts: ["0", "1", "Undefined", "-1"], ans: 1 },
    ]
  },
  "Binary Search": {
    simple: "Binary search is like finding a word in a dictionary — you open the middle, decide left or right, and repeat. It only works on sorted data.",
    technical: "Binary Search divides the search space in half each step. Time complexity: O(log n). Works only on sorted arrays. Uses mid = (low + high) / 2.",
    example: "Searching 7 in [1,3,5,7,9,11]: mid=5 → 7>5 → right half [7,9,11] → mid=9 → 7<9 → [7] → Found!",
    code: `# Python Example\ndef binary_search(arr, target):\n    low, high = 0, len(arr)-1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1`,
    quiz: [
      { q: "Time complexity of Binary Search?", opts: ["O(n)", "O(n²)", "O(log n)", "O(1)"], ans: 2 },
      { q: "Binary Search requires the array to be?", opts: ["Sorted", "Unsorted", "Empty", "Unique"], ans: 0 },
      { q: "Mid index formula?", opts: ["low+high", "(low+high)/2", "(low+high)//2", "high-low"], ans: 2 },
    ]
  },
  "OOP Concepts": {
    simple: "OOP is writing code using 'objects' — like blueprints. A Class is the blueprint, and an Object is the actual thing built from it.",
    technical: "OOP has 4 pillars: Encapsulation (hiding data), Inheritance (extending classes), Polymorphism (many forms), Abstraction (showing only essentials).",
    example: "Car class → Honda, BMW are objects. Both inherit from Car but have their own speed and color.",
    code: `# Python Example\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self): pass\n\nclass Dog(Animal):\n    def speak(self):\n        return f'{self.name} says Woof!'\n\nd = Dog('Rex')\nprint(d.speak())  # Rex says Woof!`,
    quiz: [
      { q: "Which OOP concept hides internal data?", opts: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], ans: 2 },
      { q: "Which keyword is used to inherit in Python?", opts: ["extends", "inherits", "class Child(Parent)", "super"], ans: 2 },
      { q: "What are the 4 pillars of OOP?", opts: ["ACID", "LIFO FIFO FILO LILO", "Encapsulation, Inheritance, Polymorphism, Abstraction", "None"], ans: 2 },
    ]
  },
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
  tutor: ["Great choice, {name}! Let me explain that for you. 🧠", "I'd love to help you understand that topic better!"],
  quiz: ["Let's test your knowledge! 🎯 I'll switch to the Tutor module for the quiz.", "Quiz time! Head to the Tutor section to get started."],
  motivate: ["You're doing amazing, {name}! Keep going! 🚀", "Every hour of study brings you closer to your goals! 💪"],
  unknown: ["That's an interesting question! Could you clarify — are you asking about a book, a topic, or your progress?", "I'm not sure I understood that. Try asking about a book, a topic, or your dashboard!"],
};
