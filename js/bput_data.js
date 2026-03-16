// ─── BPUT Engineering Library Database ───────────────────────────────────────
// Biju Patnaik University of Technology — All Branches, All Years
// Structure: branch > year > semester > subjects > books

const BPUT_CURRICULUM = [

    // ═══════════════════════════════════════════════════════════
    // COMPUTER SCIENCE ENGINEERING (CSE)
    // ═══════════════════════════════════════════════════════════

    // ── CSE Year 1, Semester 1 ──────────────────────────────────
    {
        branch: "CSE", year: 1, semester: 1, subjectName: "Mathematics – I", subjectCode: "BSMA1101", category: "Core", credits: "3-1-0",
        description: "Differential calculus, integral calculus, ordinary differential equations, matrices and linear algebra. Foundation for all engineering analyses.",
        books: [
            { title: "Higher Engineering Mathematics", author: "B.S. Grewal", publisher: "Khanna Publishers", edition: "44th", ISBN: "978-81-933284-9-1", type: "Textbook", rack: "CSE-1Y-MATH-01", totalCopies: 10, availableCopies: 7 },
            { title: "Advanced Engineering Mathematics", author: "Erwin Kreyszig", publisher: "Wiley", edition: "10th", ISBN: "978-0-470-45836-5", type: "Textbook", rack: "CSE-1Y-MATH-02", totalCopies: 6, availableCopies: 4 },
            { title: "Thomas' Calculus", author: "George B. Thomas", publisher: "Pearson", edition: "14th", ISBN: "978-0-13-443898-6", type: "Textbook", rack: "CSE-1Y-MATH-03", totalCopies: 5, availableCopies: 3 },
            { title: "Engineering Mathematics", author: "N.P. Bali & M. Goyal", publisher: "Laxmi Publications", edition: "9th", ISBN: "978-93-5274-339-5", type: "Textbook", rack: "CSE-1Y-MATH-04", totalCopies: 8, availableCopies: 6 },
            { title: "A Textbook of Engineering Mathematics", author: "H.K. Dass", publisher: "S. Chand", edition: "13th", ISBN: "978-81-219-2259-1", type: "Reference", rack: "CSE-1Y-MATH-05", totalCopies: 5, availableCopies: 2 },
            { title: "Calculus and Analytic Geometry", author: "G.B. Thomas & R.L. Finney", publisher: "Addison-Wesley", edition: "9th", ISBN: "978-02-017-5902-9", type: "Reference", rack: "CSE-1Y-MATH-06", totalCopies: 4, availableCopies: 4 },
        ]
    },

    {
        branch: "CSE", year: 1, semester: 1, subjectName: "Engineering Physics", subjectCode: "BSPH1101", category: "Core", credits: "3-1-0",
        description: "Mechanics, optics, quantum physics, electromagnetic theory, and modern physics topics applicable to engineering.",
        books: [
            { title: "Engineering Physics", author: "S.K. Garg, R.M. Gupta & Yogesh Singhal", publisher: "Dhanpat Rai Publications", edition: "14th", ISBN: "978-81-89928-03-9", type: "Textbook", rack: "CSE-1Y-PHY-01", totalCopies: 8, availableCopies: 5 },
            { title: "Engineering Physics", author: "M.N. Avadhanulu & P.G. Kshirsagar", publisher: "S. Chand", edition: "10th", ISBN: "978-81-219-2772-5", type: "Textbook", rack: "CSE-1Y-PHY-02", totalCopies: 6, availableCopies: 3 },
            { title: "Concepts of Modern Physics", author: "Arthur Beiser", publisher: "McGraw-Hill", edition: "6th", ISBN: "978-0-07-244848-1", type: "Reference", rack: "CSE-1Y-PHY-03", totalCopies: 4, availableCopies: 4 },
            { title: "University Physics", author: "H.D. Young & R.A. Freedman", publisher: "Pearson", edition: "15th", ISBN: "978-0-13-502661-1", type: "Reference", rack: "CSE-1Y-PHY-04", totalCopies: 5, availableCopies: 2 },
        ]
    },

    {
        branch: "CSE", year: 1, semester: 1, subjectName: "Problem Solving Using C", subjectCode: "PCC-CS101", category: "Core", credits: "3-0-0",
        description: "Introduction to programming with C language — variables, control flow, functions, arrays, pointers, structures, file handling.",
        books: [
            { title: "The C Programming Language", author: "Brian W. Kernighan & Dennis M. Ritchie", publisher: "Prentice Hall", edition: "2nd", ISBN: "978-0-13-110362-7", type: "Textbook", rack: "CSE-1Y-C-01", totalCopies: 12, availableCopies: 8 },
            { title: "Programming in ANSI C", author: "E. Balagurusamy", publisher: "McGraw-Hill", edition: "8th", ISBN: "978-93-5316-513-3", type: "Textbook", rack: "CSE-1Y-C-02", totalCopies: 10, availableCopies: 6 },
            { title: "Let Us C", author: "Y. Kanetkar", publisher: "BPB Publications", edition: "17th", ISBN: "978-93-8818-572-9", type: "Textbook", rack: "CSE-1Y-C-03", totalCopies: 8, availableCopies: 5 },
            { title: "C: How to Program", author: "Paul Deitel & Harvey Deitel", publisher: "Pearson", edition: "8th", ISBN: "978-0-13-397689-2", type: "Textbook", rack: "CSE-1Y-C-04", totalCopies: 6, availableCopies: 4 },
            { title: "Understanding Pointers in C", author: "Y. Kanetkar", publisher: "BPB Publications", edition: "5th", ISBN: "978-81-8333-327-5", type: "Reference", rack: "CSE-1Y-C-05", totalCopies: 5, availableCopies: 3 },
        ]
    },

    // ── CSE Year 1, Semester 2 ──────────────────────────────────
    {
        branch: "CSE", year: 1, semester: 2, subjectName: "Mathematics – II", subjectCode: "BSMA1201", category: "Core", credits: "3-1-0",
        description: "Partial differential equations, vector calculus, Laplace transforms, Fourier series, complex analysis.",
        books: [
            { title: "Higher Engineering Mathematics", author: "B.S. Grewal", publisher: "Khanna Publishers", edition: "44th", ISBN: "978-81-933284-9-1", type: "Textbook", rack: "CSE-1Y-MATH2-01", totalCopies: 10, availableCopies: 7 },
            { title: "Advanced Engineering Mathematics", author: "R.K. Jain & S.R.K. Iyengar", publisher: "Narosa", edition: "5th", ISBN: "978-81-8487-663-0", type: "Textbook", rack: "CSE-1Y-MATH2-02", totalCopies: 7, availableCopies: 5 },
            { title: "Engineering Mathematics", author: "Srimanta Pal & S.C. Bhunia", publisher: "Oxford", edition: "2nd", ISBN: "978-0-19-806908-2", type: "Textbook", rack: "CSE-1Y-MATH2-03", totalCopies: 6, availableCopies: 4 },
            { title: "Ordinary and Partial Differential Equations", author: "M.D. Raisinghania", publisher: "S. Chand", edition: "20th", ISBN: "978-81-219-0892-2", type: "Reference", rack: "CSE-1Y-MATH2-04", totalCopies: 5, availableCopies: 3 },
        ]
    },

    {
        branch: "CSE", year: 1, semester: 2, subjectName: "Basic Electrical Engineering", subjectCode: "BSEE1201", category: "Core", credits: "3-0-0",
        description: "DC/AC circuits, network theorems, transformers, electrical machines, and measurements. Foundation for electrical aspects of computing systems.",
        books: [
            { title: "Basic Electrical Engineering", author: "D.P. Kothari & I.J. Nagrath", publisher: "McGraw-Hill", edition: "5th", ISBN: "978-93-5316-088-6", type: "Textbook", rack: "CSE-1Y-ELE-01", totalCopies: 8, availableCopies: 5 },
            { title: "A Textbook of Electrical Technology (Vol. 1)", author: "B.L. Theraja & A.K. Theraja", publisher: "S. Chand", edition: "24th", ISBN: "978-81-219-2440-3", type: "Textbook", rack: "CSE-1Y-ELE-02", totalCopies: 7, availableCopies: 4 },
            { title: "Fundamentals of Electrical Engineering", author: "Rajendra Prasad", publisher: "PHI Learning", edition: "3rd", ISBN: "978-81-203-5014-2", type: "Reference", rack: "CSE-1Y-ELE-03", totalCopies: 5, availableCopies: 5 },
        ]
    },

    // ── CSE Year 2, Semester 3 ──────────────────────────────────
    {
        branch: "CSE", year: 2, semester: 3, subjectName: "Data Structures", subjectCode: "PCC-CS301", category: "Core", credits: "3-1-0",
        description: "Arrays, linked lists, stacks, queues, trees, graphs, hashing, sorting and searching algorithms. Core of computer science problem solving.",
        books: [
            { title: "Data Structures and Algorithm Analysis in C", author: "Mark Allen Weiss", publisher: "Pearson", edition: "2nd", ISBN: "978-0-201-49840-2", type: "Textbook", rack: "CSE-2Y-DS-01", totalCopies: 10, availableCopies: 6 },
            { title: "Data Structures Using C", author: "Reema Thareja", publisher: "Oxford", edition: "3rd", ISBN: "978-0-19-948868-3", type: "Textbook", rack: "CSE-2Y-DS-02", totalCopies: 9, availableCopies: 7 },
            { title: "Data Structures Made Easy", author: "Narasimha Karumanchi", publisher: "CareerMonk", edition: "6th", ISBN: "978-81-922-5966-5", type: "Textbook", rack: "CSE-2Y-DS-03", totalCopies: 8, availableCopies: 4 },
            { title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest & Stein", publisher: "MIT Press", edition: "4th", ISBN: "978-0-262-04630-5", type: "Textbook", rack: "CSE-2Y-DS-04", totalCopies: 6, availableCopies: 3 },
            { title: "Fundamentals of Data Structures in C", author: "E. Horowitz & S. Sahni", publisher: "Universities Press", edition: "2nd", ISBN: "978-81-7371-605-8", type: "Reference", rack: "CSE-2Y-DS-05", totalCopies: 5, availableCopies: 5 },
            { title: "The Art of Computer Programming (Vol.1)", author: "Donald E. Knuth", publisher: "Addison-Wesley", edition: "3rd", ISBN: "978-0-201-89683-1", type: "Reference", rack: "CSE-2Y-DS-06", totalCopies: 3, availableCopies: 2 },
        ]
    },

    {
        branch: "CSE", year: 2, semester: 3, subjectName: "Digital Logic Design", subjectCode: "PCC-CS302", category: "Core", credits: "3-0-0",
        description: "Boolean algebra, logic gates, combinational circuits, sequential circuits, flip-flops, counters, registers, and memory systems.",
        books: [
            { title: "Digital Design", author: "M. Morris Mano & Michael D. Ciletti", publisher: "Pearson", edition: "5th", ISBN: "978-0-13-277420-8", type: "Textbook", rack: "CSE-2Y-DLD-01", totalCopies: 9, availableCopies: 6 },
            { title: "Digital Electronics and Logic Design", author: "Sanjay Sharma", publisher: "S.K. Kataria", edition: "5th", ISBN: "978-93-5014-832-5", type: "Textbook", rack: "CSE-2Y-DLD-02", totalCopies: 7, availableCopies: 5 },
            { title: "Fundamentals of Digital Circuits", author: "A. Anand Kumar", publisher: "PHI Learning", edition: "4th", ISBN: "978-81-203-5107-1", type: "Textbook", rack: "CSE-2Y-DLD-03", totalCopies: 8, availableCopies: 4 },
            { title: "Digital Systems: Principles and Applications", author: "Ronald J. Tocci", publisher: "Pearson", edition: "12th", ISBN: "978-0-13-348161-3", type: "Reference", rack: "CSE-2Y-DLD-04", totalCopies: 5, availableCopies: 3 },
            { title: "Digital Integrated Electronics", author: "H. Taub & D. Schilling", publisher: "McGraw-Hill", edition: "2nd", ISBN: "978-0-07-062945-2", type: "Reference", rack: "CSE-2Y-DLD-05", totalCopies: 4, availableCopies: 4 },
        ]
    },

    {
        branch: "CSE", year: 2, semester: 3, subjectName: "Object-Oriented Programming (Java)", subjectCode: "PCC-CS303", category: "Core", credits: "3-0-0",
        description: "OOP concepts: classes, objects, inheritance, polymorphism, encapsulation, exception handling, I/O, Java collections framework.",
        books: [
            { title: "Core Java Volume I – Fundamentals", author: "Cay S. Horstmann", publisher: "Pearson", edition: "12th", ISBN: "978-0-13-516630-7", type: "Textbook", rack: "CSE-2Y-JAVA-01", totalCopies: 10, availableCopies: 7 },
            { title: "Java: The Complete Reference", author: "Herbert Schildt", publisher: "McGraw-Hill", edition: "12th", ISBN: "978-1-26-046394-1", type: "Textbook", rack: "CSE-2Y-JAVA-02", totalCopies: 9, availableCopies: 5 },
            { title: "Head First Java", author: "Kathy Sierra & Bert Bates", publisher: "O'Reilly", edition: "3rd", ISBN: "978-1-491-91023-4", type: "Textbook", rack: "CSE-2Y-JAVA-03", totalCopies: 6, availableCopies: 4 },
            { title: "Object-Oriented Programming with Java", author: "T. Budd", publisher: "Pearson", edition: "1st", ISBN: "978-0-20-181186-5", type: "Reference", rack: "CSE-2Y-JAVA-04", totalCopies: 4, availableCopies: 4 },
        ]
    },

    // ── CSE Year 2, Semester 4 ──────────────────────────────────
    {
        branch: "CSE", year: 2, semester: 4, subjectName: "Design and Analysis of Algorithms", subjectCode: "PCC-CS401", category: "Core", credits: "3-1-0",
        description: "Algorithm analysis, divide-and-conquer, greedy algorithms, dynamic programming, backtracking, branch-and-bound, NP-completeness.",
        books: [
            { title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest & Stein", publisher: "MIT Press", edition: "4th", ISBN: "978-0-262-04630-5", type: "Textbook", rack: "CSE-2Y-DAA-01", totalCopies: 10, availableCopies: 6 },
            { title: "Algorithm Design", author: "Jon Kleinberg & Éva Tardos", publisher: "Pearson", edition: "1st", ISBN: "978-0-321-29535-4", type: "Textbook", rack: "CSE-2Y-DAA-02", totalCopies: 7, availableCopies: 5 },
            { title: "The Algorithm Design Manual", author: "Steven S. Skiena", publisher: "Springer", edition: "3rd", ISBN: "978-3-030-54255-9", type: "Textbook", rack: "CSE-2Y-DAA-03", totalCopies: 6, availableCopies: 4 },
            { title: "Algorithms", author: "Robert Sedgewick & Kevin Wayne", publisher: "Addison-Wesley", edition: "4th", ISBN: "978-0-321-57351-3", type: "Reference", rack: "CSE-2Y-DAA-04", totalCopies: 5, availableCopies: 3 },
            { title: "Computer Algorithms", author: "E. Horowitz, S. Sahni & S. Rajasekaran", publisher: "Universities Press", edition: "2nd", ISBN: "978-81-7371-636-2", type: "Reference", rack: "CSE-2Y-DAA-05", totalCopies: 5, availableCopies: 5 },
        ]
    },

    {
        branch: "CSE", year: 2, semester: 4, subjectName: "Database Management Systems", subjectCode: "PCC-CS402", category: "Core", credits: "3-1-0",
        description: "ER modeling, relational algebra, SQL, normalization, transaction management, concurrency control, recovery, and NoSQL overview.",
        books: [
            { title: "Database System Concepts", author: "Silberschatz, Korth & Sudarshan", publisher: "McGraw-Hill", edition: "7th", ISBN: "978-0-07-802215-9", type: "Textbook", rack: "CSE-2Y-DBMS-01", totalCopies: 10, availableCopies: 7 },
            { title: "Fundamentals of Database Systems", author: "Elmasri & Navathe", publisher: "Pearson", edition: "7th", ISBN: "978-0-13-397077-7", type: "Textbook", rack: "CSE-2Y-DBMS-02", totalCopies: 8, availableCopies: 5 },
            { title: "Database Management Systems", author: "Raghu Ramakrishnan & Johannes Gehrke", publisher: "McGraw-Hill", edition: "3rd", ISBN: "978-0-07-246563-1", type: "Textbook", rack: "CSE-2Y-DBMS-03", totalCopies: 7, availableCopies: 4 },
            { title: "SQL: The Complete Reference", author: "James Groff & Paul Weinberg", publisher: "McGraw-Hill", edition: "3rd", ISBN: "978-0-07-159255-0", type: "Reference", rack: "CSE-2Y-DBMS-04", totalCopies: 5, availableCopies: 3 },
            { title: "MongoDB: The Definitive Guide", author: "Kristina Chodorow", publisher: "O'Reilly", edition: "3rd", ISBN: "978-1-491-95446-1", type: "Reference", rack: "CSE-2Y-DBMS-05", totalCopies: 4, availableCopies: 4 },
        ]
    },

    {
        branch: "CSE", year: 2, semester: 4, subjectName: "Python Programming", subjectCode: "OEC-CS401", category: "Open Elective", credits: "3-0-0",
        description: "Python basics, control flow, functions, OOP, file handling, modules, and introduction to data science libraries.",
        books: [
            { title: "Let Us Python", author: "Yashavant Kanetkar & Aditya Kanetkar", publisher: "BPB Publications", edition: "6th", ISBN: "9789355515414", type: "Textbook", rack: "CSE-2Y-PY-01", totalCopies: 5, availableCopies: 4 },
        ]
    },

    // ── CSE Year 3, Semester 5 ──────────────────────────────────
    {
        branch: "CSE", year: 3, semester: 5, subjectName: "Computer Networks", subjectCode: "PCC-CS501", category: "Core", credits: "3-1-0",
        description: "OSI and TCP/IP model, LAN/WAN, routing protocols, transport layer, application layer protocols, network security fundamentals.",
        books: [
            { title: "Computer Networks", author: "Andrew S. Tanenbaum & David J. Wetherall", publisher: "Pearson", edition: "5th", ISBN: "978-0-13-212695-3", type: "Textbook", rack: "CSE-3Y-CN-01", totalCopies: 10, availableCopies: 6 },
            { title: "Data Communications and Networking", author: "Behrouz A. Forouzan", publisher: "McGraw-Hill", edition: "5th", ISBN: "978-0-07-338036-2", type: "Textbook", rack: "CSE-3Y-CN-02", totalCopies: 9, availableCopies: 5 },
            { title: "Computer Networking: A Top-Down Approach", author: "James F. Kurose & Keith W. Ross", publisher: "Pearson", edition: "8th", ISBN: "978-0-13-681477-2", type: "Textbook", rack: "CSE-3Y-CN-03", totalCopies: 8, availableCopies: 4 },
            { title: "TCP/IP Illustrated Volume 1", author: "W. Richard Stevens", publisher: "Addison-Wesley", edition: "2nd", ISBN: "978-0-201-63346-7", type: "Reference", rack: "CSE-3Y-CN-04", totalCopies: 4, availableCopies: 3 },
        ]
    },

    {
        branch: "CSE", year: 3, semester: 5, subjectName: "Operating Systems", subjectCode: "PCC-CS502", category: "Core", credits: "3-1-0",
        description: "Process management, scheduling, memory management, virtual memory, file systems, I/O management, deadlocks, security.",
        books: [
            { title: "Operating System Concepts", author: "Abraham Silberschatz, Peter Galvin & Greg Gagne", publisher: "Wiley", edition: "10th", ISBN: "978-1-119-32091-3", type: "Textbook", rack: "CSE-3Y-OS-01", totalCopies: 10, availableCopies: 7 },
            { title: "Modern Operating Systems", author: "Andrew S. Tanenbaum & Herbert Bos", publisher: "Pearson", edition: "4th", ISBN: "978-0-13-359162-0", type: "Textbook", rack: "CSE-3Y-OS-02", totalCopies: 8, availableCopies: 5 },
            { title: "Operating Systems: Internals and Design Principles", author: "William Stallings", publisher: "Pearson", edition: "9th", ISBN: "978-0-13-471942-7", type: "Textbook", rack: "CSE-3Y-OS-03", totalCopies: 7, availableCopies: 4 },
            { title: "The Design of the UNIX Operating System", author: "Maurice J. Bach", publisher: "PHI", edition: "1st", ISBN: "978-0-13-201757-4", type: "Reference", rack: "CSE-3Y-OS-04", totalCopies: 4, availableCopies: 2 },
        ]
    },

    {
        branch: "CSE", year: 3, semester: 5, subjectName: "Software Engineering", subjectCode: "PCC-CS503", category: "Core", credits: "3-0-0",
        description: "SDLC models, requirements analysis, UML, software design patterns, testing strategies, project management, quality assurance.",
        books: [
            { title: "Software Engineering: A Practitioner's Approach", author: "Roger S. Pressman & Bruce I. Maxim", publisher: "McGraw-Hill", edition: "8th", ISBN: "978-0-07-802297-5", type: "Textbook", rack: "CSE-3Y-SE-01", totalCopies: 9, availableCopies: 6 },
            { title: "Software Engineering", author: "Ian Sommerville", publisher: "Pearson", edition: "10th", ISBN: "978-0-13-394303-0", type: "Textbook", rack: "CSE-3Y-SE-02", totalCopies: 8, availableCopies: 5 },
            { title: "Object-Oriented Software Engineering", author: "Bernd Bruegge & Allen H. Dutoit", publisher: "Pearson", edition: "3rd", ISBN: "978-0-13-613931-7", type: "Reference", rack: "CSE-3Y-SE-03", totalCopies: 5, availableCopies: 4 },
        ]
    },

    {
        branch: "CSE", year: 3, semester: 6, subjectName: "Compiler Design", subjectCode: "PCC-CS601", category: "Core", credits: "3-1-0",
        description: "Lexical analysis, syntax analysis, parsing techniques, semantic analysis, intermediate code generation, code optimization, code generation.",
        books: [
            { title: "Compilers: Principles, Techniques and Tools", author: "Aho, Lam, Sethi & Ullman", publisher: "Pearson", edition: "2nd", ISBN: "978-0-321-48681-3", type: "Textbook", rack: "CSE-3Y-CD-01", totalCopies: 9, availableCopies: 5 },
            { title: "Engineering a Compiler", author: "Keith D. Cooper & Linda Torczon", publisher: "Morgan Kaufmann", edition: "3rd", ISBN: "978-0-12-815412-0", type: "Textbook", rack: "CSE-3Y-CD-02", totalCopies: 6, availableCopies: 4 },
            { title: "Modern Compiler Implementation in Java", author: "Andrew W. Appel", publisher: "Cambridge", edition: "2nd", ISBN: "978-0-521-82060-8", type: "Reference", rack: "CSE-3Y-CD-03", totalCopies: 4, availableCopies: 3 },
        ]
    },

    {
        branch: "CSE", year: 3, semester: 6, subjectName: "Artificial Intelligence", subjectCode: "PEC-CS602", category: "Elective", credits: "3-0-0",
        description: "AI concepts, search algorithms, knowledge representation, expert systems, natural language processing, machine learning overview, neural networks.",
        books: [
            { title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell & Peter Norvig", publisher: "Pearson", edition: "4th", ISBN: "978-0-13-461099-3", type: "Textbook", rack: "CSE-3Y-AI-01", totalCopies: 10, availableCopies: 6 },
            { title: "Introduction to Artificial Intelligence", author: "Wolfgang Ertel", publisher: "Springer", edition: "2nd", ISBN: "978-3-319-58486-7", type: "Textbook", rack: "CSE-3Y-AI-02", totalCopies: 6, availableCopies: 4 },
            { title: "AI: A Guide to Intelligent Systems", author: "Michael Negnevitsky", publisher: "Pearson", edition: "3rd", ISBN: "978-0-32-120466-8", type: "Reference", rack: "CSE-3Y-AI-03", totalCopies: 5, availableCopies: 5 },
        ]
    },

    // ── CSE Year 4, Semester 7 ──────────────────────────────────
    {
        branch: "CSE", year: 4, semester: 7, subjectName: "Machine Learning", subjectCode: "PEC-CS701", category: "Elective", credits: "3-0-0",
        description: "Supervised, unsupervised and reinforcement learning; regression, classification, clustering, dimensionality reduction, neural networks, deep learning.",
        books: [
            { title: "Pattern Recognition and Machine Learning", author: "Christopher M. Bishop", publisher: "Springer", edition: "1st", ISBN: "978-0-387-31073-2", type: "Textbook", rack: "CSE-4Y-ML-01", totalCopies: 8, availableCopies: 5 },
            { title: "Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow", author: "Aurélien Géron", publisher: "O'Reilly", edition: "3rd", ISBN: "978-1-098-12597-4", type: "Textbook", rack: "CSE-4Y-ML-02", totalCopies: 7, availableCopies: 4 },
            { title: "Machine Learning", author: "Tom M. Mitchell", publisher: "McGraw-Hill", edition: "1st", ISBN: "978-0-07-042807-2", type: "Textbook", rack: "CSE-4Y-ML-03", totalCopies: 6, availableCopies: 4 },
            { title: "Deep Learning", author: "Ian Goodfellow, Yoshua Bengio & Aaron Courville", publisher: "MIT Press", edition: "1st", ISBN: "978-0-262-03561-3", type: "Reference", rack: "CSE-4Y-ML-04", totalCopies: 5, availableCopies: 3 },
        ]
    },

    {
        branch: "CSE", year: 4, semester: 7, subjectName: "Cloud Computing", subjectCode: "PEC-CS702", category: "Elective", credits: "3-0-0",
        description: "Cloud architecture, virtualization, IaaS/PaaS/SaaS, AWS/Azure/GCP concepts, container technologies, microservices, serverless computing.",
        books: [
            { title: "Cloud Computing: Concepts, Technology & Architecture", author: "Thomas Erl", publisher: "Prentice Hall", edition: "1st", ISBN: "978-0-13-388619-0", type: "Textbook", rack: "CSE-4Y-CC-01", totalCopies: 7, availableCopies: 5 },
            { title: "Cloud Computing: Principles and Paradigms", author: "Rajkumar Buyya", publisher: "Wiley", edition: "1st", ISBN: "978-0-470-88799-8", type: "Textbook", rack: "CSE-4Y-CC-02", totalCopies: 6, availableCopies: 4 },
            { title: "The Practice of Cloud System Administration", author: "Thomas A. Limoncelli", publisher: "Addison-Wesley", edition: "1st", ISBN: "978-0-32-194318-9", type: "Reference", rack: "CSE-4Y-CC-03", totalCopies: 4, availableCopies: 4 },
        ]
    },

    {
        branch: "CSE", year: 4, semester: 8, subjectName: "Information Security", subjectCode: "PEC-CS801", category: "Elective", credits: "3-0-0",
        description: "Cryptography, network security, authentication, public key infrastructure, firewalls, intrusion detection, digital forensics.",
        books: [
            { title: "Cryptography and Network Security", author: "William Stallings", publisher: "Pearson", edition: "8th", ISBN: "978-0-13-477027-3", type: "Textbook", rack: "CSE-4Y-IS-01", totalCopies: 9, availableCopies: 6 },
            { title: "Introduction to Computer Security", author: "Matt Bishop", publisher: "Addison-Wesley", edition: "1st", ISBN: "978-0-32-124744-4", type: "Textbook", rack: "CSE-4Y-IS-02", totalCopies: 7, availableCopies: 4 },
            { title: "Computer Security: Art and Science", author: "Matt Bishop", publisher: "Addison-Wesley", edition: "2nd", ISBN: "978-0-32-171233-1", type: "Reference", rack: "CSE-4Y-IS-03", totalCopies: 4, availableCopies: 3 },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // ELECTRONICS & COMMUNICATION ENGINEERING (ECE)
    // ═══════════════════════════════════════════════════════════

    {
        branch: "ECE", year: 1, semester: 1, subjectName: "Mathematics – I", subjectCode: "BSMA1101", category: "Core", credits: "3-1-0",
        description: "Differential calculus, integral calculus, ordinary differential equations, matrices, linear algebra.",
        books: [
            { title: "Higher Engineering Mathematics", author: "B.S. Grewal", publisher: "Khanna Publishers", edition: "44th", ISBN: "978-81-933284-9-1", type: "Textbook", rack: "ECE-1Y-MATH-01", totalCopies: 10, availableCopies: 7 },
            { title: "Engineering Mathematics", author: "N.P. Bali", publisher: "Laxmi Publications", edition: "9th", ISBN: "978-93-5274-339-5", type: "Textbook", rack: "ECE-1Y-MATH-02", totalCopies: 7, availableCopies: 5 },
            { title: "Advanced Engineering Mathematics", author: "Erwin Kreyszig", publisher: "Wiley", edition: "10th", ISBN: "978-0-470-45836-5", type: "Reference", rack: "ECE-1Y-MATH-03", totalCopies: 5, availableCopies: 3 },
        ]
    },

    {
        branch: "ECE", year: 2, semester: 3, subjectName: "Network Theory", subjectCode: "PCC-EC301", category: "Core", credits: "3-1-0",
        description: "Circuit analysis methods, network theorems, two-port networks, graph theory, transient analysis, frequency domain methods.",
        books: [
            { title: "Engineering Circuit Analysis", author: "Hayt, Kemmerly & Durbin", publisher: "McGraw-Hill", edition: "8th", ISBN: "978-0-07-352917-3", type: "Textbook", rack: "ECE-2Y-NT-01", totalCopies: 9, availableCopies: 6 },
            { title: "Network Analysis", author: "M.E. Van Valkenburg", publisher: "PHI Learning", edition: "3rd", ISBN: "978-81-203-0559-4", type: "Textbook", rack: "ECE-2Y-NT-02", totalCopies: 8, availableCopies: 5 },
            { title: "Network Theory", author: "A. Sudhakar & Shyammohan Palli", publisher: "McGraw-Hill", edition: "2nd", ISBN: "978-0-07-063847-8", type: "Textbook", rack: "ECE-2Y-NT-03", totalCopies: 7, availableCopies: 4 },
            { title: "Electric Circuits", author: "Nilsson & Riedel", publisher: "Pearson", edition: "11th", ISBN: "978-0-13-458044-3", type: "Reference", rack: "ECE-2Y-NT-04", totalCopies: 4, availableCopies: 3 },
        ]
    },

    {
        branch: "ECE", year: 2, semester: 3, subjectName: "Analog Electronics", subjectCode: "PCC-EC302", category: "Core", credits: "3-1-0",
        description: "Semiconductor devices, BJT and FET amplifiers, feedback amplifiers, oscillators, power amplifiers, operational amplifiers.",
        books: [
            { title: "Electronic Devices and Circuit Theory", author: "Robert L. Boylestad & Louis Nashelsky", publisher: "Pearson", edition: "11th", ISBN: "978-0-13-262226-4", type: "Textbook", rack: "ECE-2Y-AE-01", totalCopies: 10, availableCopies: 7 },
            { title: "Microelectronics Circuits", author: "Adel S. Sedra & Kenneth C. Smith", publisher: "Oxford", edition: "7th", ISBN: "978-0-19-933914-7", type: "Textbook", rack: "ECE-2Y-AE-02", totalCopies: 8, availableCopies: 5 },
            { title: "Electronic Circuits: Analysis and Design", author: "D.A. Neamen", publisher: "McGraw-Hill", edition: "3rd", ISBN: "978-0-07-232-308-8", type: "Textbook", rack: "ECE-2Y-AE-03", totalCopies: 7, availableCopies: 4 },
            { title: "Integrated Electronics", author: "Millman & Halkias", publisher: "McGraw-Hill", edition: "2nd", ISBN: "978-0-07-099444-5", type: "Reference", rack: "ECE-2Y-AE-04", totalCopies: 5, availableCopies: 5 },
        ]
    },

    {
        branch: "ECE", year: 2, semester: 4, subjectName: "Signals and Systems", subjectCode: "PCC-EC401", category: "Core", credits: "3-1-0",
        description: "Continuous and discrete time signals, LTI systems, Fourier series, Fourier transform, Laplace transform, Z-transform, sampling theorem.",
        books: [
            { title: "Signals and Systems", author: "Alan V. Oppenheim & Alan S. Willsky", publisher: "Pearson", edition: "2nd", ISBN: "978-0-13-814757-0", type: "Textbook", rack: "ECE-2Y-SS-01", totalCopies: 10, availableCopies: 6 },
            { title: "Signals and Systems", author: "Simon Haykin & Barry Van Veen", publisher: "Wiley", edition: "2nd", ISBN: "978-0-471-16474-4", type: "Textbook", rack: "ECE-2Y-SS-02", totalCopies: 8, availableCopies: 5 },
            { title: "Signals and Systems", author: "P. Ramakrishna Rao", publisher: "McGraw-Hill", edition: "1st", ISBN: "978-0-07-067453-7", type: "Textbook", rack: "ECE-2Y-SS-03", totalCopies: 7, availableCopies: 4 },
            { title: "Digital Signal Processing", author: "Proakis & Manolakis", publisher: "Pearson", edition: "4th", ISBN: "978-0-13-187374-2", type: "Reference", rack: "ECE-2Y-SS-04", totalCopies: 5, availableCopies: 3 },
        ]
    },

    {
        branch: "ECE", year: 3, semester: 5, subjectName: "Digital Communications", subjectCode: "PCC-EC501", category: "Core", credits: "3-1-0",
        description: "Pulse modulation, baseband transmission, digital modulation techniques (ASK, FSK, PSK, QAM), error control coding, spread spectrum.",
        books: [
            { title: "Digital Communications", author: "John G. Proakis & Masoud Salehi", publisher: "McGraw-Hill", edition: "5th", ISBN: "978-0-07-295716-4", type: "Textbook", rack: "ECE-3Y-DC-01", totalCopies: 9, availableCopies: 5 },
            { title: "Communication Systems", author: "Simon Haykin", publisher: "Wiley", edition: "4th", ISBN: "978-0-471-40479-1", type: "Textbook", rack: "ECE-3Y-DC-02", totalCopies: 8, availableCopies: 4 },
            { title: "Principles of Communication Systems", author: "Taub & Schilling", publisher: "McGraw-Hill", edition: "3rd", ISBN: "978-0-07-062955-1", type: "Reference", rack: "ECE-3Y-DC-03", totalCopies: 5, availableCopies: 5 },
        ]
    },

    {
        branch: "ECE", year: 3, semester: 5, subjectName: "VLSI Design", subjectCode: "PEC-EC502", category: "Elective", credits: "3-0-0",
        description: "MOS transistors, CMOS circuit design, digital logic families, VLSI design flow, HDL, FPGA and ASIC design methodology.",
        books: [
            { title: "VLSI Design", author: "Kamran Eshraghian & Douglas A. Pucknell", publisher: "PHI Learning", edition: "5th", ISBN: "978-81-203-1449-7", type: "Textbook", rack: "ECE-3Y-VLSI-01", totalCopies: 7, availableCopies: 4 },
            { title: "CMOS VLSI Design", author: "Weste & Harris", publisher: "Pearson", edition: "4th", ISBN: "978-0-321-54774-3", type: "Textbook", rack: "ECE-3Y-VLSI-02", totalCopies: 7, availableCopies: 5 },
            { title: "Digital Design with RTL Design, VHDL, and Verilog", author: "Frank Vahid", publisher: "Wiley", edition: "2nd", ISBN: "978-0-470-53108-5", type: "Reference", rack: "ECE-3Y-VLSI-03", totalCopies: 5, availableCopies: 3 },
        ]
    },

    {
        branch: "ECE", year: 4, semester: 7, subjectName: "Wireless Communication", subjectCode: "PEC-EC701", category: "Elective", credits: "3-0-0",
        description: "Mobile radio propagation, multipath fading, diversity techniques, OFDM, CDMA, LTE, 5G architecture, antenna design.",
        books: [
            { title: "Wireless Communications", author: "Andrea Goldsmith", publisher: "Cambridge", edition: "1st", ISBN: "978-0-521-83716-3", type: "Textbook", rack: "ECE-4Y-WC-01", totalCopies: 7, availableCopies: 4 },
            { title: "Wireless Communications: Principles and Practice", author: "Theodore S. Rappaport", publisher: "Pearson", edition: "2nd", ISBN: "978-0-13-042232-3", type: "Textbook", rack: "ECE-4Y-WC-02", totalCopies: 6, availableCopies: 3 },
            { title: "Principles of Mobile Communication", author: "Gordon L. Stüber", publisher: "Springer", edition: "4th", ISBN: "978-3-319-55614-1", type: "Reference", rack: "ECE-4Y-WC-03", totalCopies: 4, availableCopies: 4 },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // ELECTRICAL ENGINEERING (EE)
    // ═══════════════════════════════════════════════════════════

    {
        branch: "EE", year: 2, semester: 3, subjectName: "Electrical Machines – I", subjectCode: "PCC-EE301", category: "Core", credits: "3-1-0",
        description: "DC machines: construction, EMF, torque, characteristics, starting, speed control. Transformers: construction, equivalent circuit, tests, efficiency.",
        books: [
            { title: "Electrical Machinery Fundamentals", author: "Stephen J. Chapman", publisher: "McGraw-Hill", edition: "5th", ISBN: "978-0-07-353736-9", type: "Textbook", rack: "EE-2Y-EM-01", totalCopies: 9, availableCopies: 6 },
            { title: "A Textbook of Electrical Technology (Vol. 2)", author: "B.L. Theraja & A.K. Theraja", publisher: "S. Chand", edition: "24th", ISBN: "978-81-219-2441-0", type: "Textbook", rack: "EE-2Y-EM-02", totalCopies: 8, availableCopies: 5 },
            { title: "Electric Machinery", author: "Fitzgerald, Kingsley & Umans", publisher: "McGraw-Hill", edition: "7th", ISBN: "978-0-07-352954-8", type: "Textbook", rack: "EE-2Y-EM-03", totalCopies: 7, availableCopies: 4 },
            { title: "Electrical Machines", author: "I.J. Nagrath & D.P. Kothari", publisher: "McGraw-Hill", edition: "7th", ISBN: "978-93-5316-178-4", type: "Reference", rack: "EE-2Y-EM-04", totalCopies: 6, availableCopies: 4 },
        ]
    },

    {
        branch: "EE", year: 3, semester: 5, subjectName: "Power Systems – I", subjectCode: "PCC-EE501", category: "Core", credits: "3-1-0",
        description: "Power system structure, overhead lines, cable systems, per-unit analysis, symmetrical fault analysis, power flow studies.",
        books: [
            { title: "Power System Engineering", author: "D. Stevenson & J. Grainger", publisher: "McGraw-Hill", edition: "2nd", ISBN: "978-0-07-061088-7", type: "Textbook", rack: "EE-3Y-PS-01", totalCopies: 9, availableCopies: 6 },
            { title: "Elements of Power Systems Analysis", author: "Stevenson & Grainger", publisher: "McGraw-Hill", edition: "4th", ISBN: "978-0-07-061026-9", type: "Textbook", rack: "EE-3Y-PS-02", totalCopies: 7, availableCopies: 5 },
            { title: "Modern Power System Analysis", author: "I.J. Nagrath & D.P. Kothari", publisher: "McGraw-Hill", edition: "4th", ISBN: "978-0-07-069682-9", type: "Textbook", rack: "EE-3Y-PS-03", totalCopies: 8, availableCopies: 4 },
            { title: "Electrical Power Systems", author: "C.L. Wadhwa", publisher: "New Age International", edition: "7th", ISBN: "978-81-224-3867-0", type: "Reference", rack: "EE-3Y-PS-04", totalCopies: 5, availableCopies: 3 },
        ]
    },

    {
        branch: "EE", year: 3, semester: 6, subjectName: "Control Systems", subjectCode: "PCC-EE601", category: "Core", credits: "3-1-0",
        description: "Transfer functions, block diagrams, signal flow graphs, time-domain and frequency-domain analysis, stability, Bode plot, root locus.",
        books: [
            { title: "Control Systems Engineering", author: "Norman S. Nise", publisher: "Wiley", edition: "7th", ISBN: "978-1-118-17051-9", type: "Textbook", rack: "EE-3Y-CS-01", totalCopies: 9, availableCopies: 5 },
            { title: "Modern Control Engineering", author: "Katsuhiko Ogata", publisher: "Pearson", edition: "5th", ISBN: "978-0-13-615673-4", type: "Textbook", rack: "EE-3Y-CS-02", totalCopies: 8, availableCopies: 4 },
            { title: "Automatic Control Systems", author: "Farid Golnaraghi & Benjamin C. Kuo", publisher: "McGraw-Hill", edition: "10th", ISBN: "978-0-07-338462-9", type: "Textbook", rack: "EE-3Y-CS-03", totalCopies: 6, availableCopies: 3 },
            { title: "Control Systems", author: "A. Nagoor Kani", publisher: "RBA Publications", edition: "5th", ISBN: "978-93-8386-518-2", type: "Reference", rack: "EE-3Y-CS-04", totalCopies: 5, availableCopies: 5 },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // CIVIL ENGINEERING
    // ═══════════════════════════════════════════════════════════

    {
        branch: "Civil", year: 2, semester: 3, subjectName: "Structural Analysis – I", subjectCode: "PCC-CV301", category: "Core", credits: "3-1-0",
        description: "Statically determinate structures, beams, frames, cables, influence lines, Muller-Breslau principle, energy methods.",
        books: [
            { title: "Structural Analysis", author: "R.C. Hibbeler", publisher: "Pearson", edition: "10th", ISBN: "978-0-13-454397-4", type: "Textbook", rack: "CIV-2Y-SA-01", totalCopies: 9, availableCopies: 6 },
            { title: "Theory of Structures", author: "B.C. Punmia", publisher: "Laxmi Publications", edition: "10th", ISBN: "978-81-318-0128-7", type: "Textbook", rack: "CIV-2Y-SA-02", totalCopies: 8, availableCopies: 5 },
            { title: "Structural Analysis", author: "C.S. Reddy", publisher: "Tata McGraw-Hill", edition: "2nd", ISBN: "978-0-07-013568-6", type: "Textbook", rack: "CIV-2Y-SA-03", totalCopies: 7, availableCopies: 4 },
            { title: "Intermediate Structural Analysis", author: "C.K. Wang", publisher: "McGraw-Hill", edition: "1st", ISBN: "978-0-07-068112-7", type: "Reference", rack: "CIV-2Y-SA-04", totalCopies: 4, availableCopies: 3 },
        ]
    },

    {
        branch: "Civil", year: 3, semester: 5, subjectName: "RCC Design", subjectCode: "PCC-CV501", category: "Core", credits: "3-1-0",
        description: "Working stress and limit state methods, design of beams, slabs, columns, footings, retaining walls as per IS 456:2000.",
        books: [
            { title: "Design of Reinforced Concrete Structures", author: "M.L. Gambhir", publisher: "PHI Learning", edition: "3rd", ISBN: "978-81-203-4266-6", type: "Textbook", rack: "CIV-3Y-RCC-01", totalCopies: 9, availableCopies: 6 },
            { title: "Reinforced Concrete Design", author: "S. Unnikrishna Pillai & Devdas Menon", publisher: "Tata McGraw-Hill", edition: "3rd", ISBN: "978-0-07-025914-4", type: "Textbook", rack: "CIV-3Y-RCC-02", totalCopies: 8, availableCopies: 5 },
            { title: "Reinforced Concrete Structures", author: "B.C. Punmia", publisher: "Laxmi Publications", edition: "10th", ISBN: "978-81-318-0156-0", type: "Textbook", rack: "CIV-3Y-RCC-03", totalCopies: 7, availableCopies: 4 },
            { title: "IS 456:2000 – Plain and Reinforced Concrete", author: "Bureau of Indian Standards", publisher: "BIS", edition: "4th", ISBN: "978-81-700-0032-2", type: "Reference", rack: "CIV-3Y-RCC-04", totalCopies: 5, availableCopies: 5 },
        ]
    },

    {
        branch: "Civil", year: 3, semester: 6, subjectName: "Soil Mechanics", subjectCode: "PCC-CV601", category: "Core", credits: "3-1-0",
        description: "Soil classification, index properties, permeability, seepage analysis, stress distribution, consolidation, shear strength of soils.",
        books: [
            { title: "Soil Mechanics and Foundations", author: "B.C. Punmia", publisher: "Laxmi Publications", edition: "16th", ISBN: "978-81-318-0001-3", type: "Textbook", rack: "CIV-3Y-SM-01", totalCopies: 9, availableCopies: 6 },
            { title: "Principles of Geotechnical Engineering", author: "Braja M. Das & Khaled Sobhan", publisher: "Cengage", edition: "9th", ISBN: "978-1-305-97093-2", type: "Textbook", rack: "CIV-3Y-SM-02", totalCopies: 7, availableCopies: 4 },
            { title: "Soil Mechanics", author: "T.W. Lambe & R.V. Whitman", publisher: "Wiley", edition: "1st", ISBN: "978-0-47-151192-0", type: "Reference", rack: "CIV-3Y-SM-03", totalCopies: 4, availableCopies: 3 },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // MECHANICAL ENGINEERING
    // ═══════════════════════════════════════════════════════════

    {
        branch: "Mechanical", year: 2, semester: 3, subjectName: "Thermodynamics", subjectCode: "PCC-ME301", category: "Core", credits: "3-1-0",
        description: "Laws of thermodynamics, properties of pure substances, power and refrigeration cycles, gas mixtures, psychrometrics, combustion.",
        books: [
            { title: "Engineering Thermodynamics", author: "P.K. Nag", publisher: "McGraw-Hill", edition: "6th", ISBN: "978-93-5316-037-4", type: "Textbook", rack: "MECH-2Y-THERMO-01", totalCopies: 9, availableCopies: 6 },
            { title: "Thermodynamics: An Engineering Approach", author: "Cengel & Boles", publisher: "McGraw-Hill", edition: "9th", ISBN: "978-1-259-82267-6", type: "Textbook", rack: "MECH-2Y-THERMO-02", totalCopies: 8, availableCopies: 5 },
            { title: "Fundamentals of Engineering Thermodynamics", author: "Moran, Shapiro & Boettner", publisher: "Wiley", edition: "9th", ISBN: "978-1-119-39174-4", type: "Textbook", rack: "MECH-2Y-THERMO-03", totalCopies: 6, availableCopies: 4 },
            { title: "Classical Thermodynamics", author: "H.B. Kallen", publisher: "Wiley", edition: "1st", ISBN: "978-0-47-147307-1", type: "Reference", rack: "MECH-2Y-THERMO-04", totalCopies: 4, availableCopies: 4 },
        ]
    },

    {
        branch: "Mechanical", year: 3, semester: 5, subjectName: "Machine Design", subjectCode: "PCC-ME501", category: "Core", credits: "3-1-0",
        description: "Design philosophy, failure modes, design of shafts, keys, couplings, bearings, gears, springs, belt drives, brakes and clutches.",
        books: [
            { title: "Machine Design", author: "R.S. Khurmi & J.K. Gupta", publisher: "S. Chand", edition: "14th", ISBN: "978-81-219-2537-0", type: "Textbook", rack: "MECH-3Y-MD-01", totalCopies: 10, availableCopies: 7 },
            { title: "Shigley's Mechanical Engineering Design", author: "Budynas & Nisbett", publisher: "McGraw-Hill", edition: "11th", ISBN: "978-1-260-11346-2", type: "Textbook", rack: "MECH-3Y-MD-02", totalCopies: 8, availableCopies: 5 },
            { title: "Design of Machine Elements", author: "V.B. Bhandari", publisher: "McGraw-Hill", edition: "4th", ISBN: "978-93-5260-443-0", type: "Textbook", rack: "MECH-3Y-MD-03", totalCopies: 7, availableCopies: 4 },
            { title: "Machine Elements in Mechanical Design", author: "Robert L. Mott", publisher: "Pearson", edition: "6th", ISBN: "978-0-13-441436-3", type: "Reference", rack: "MECH-3Y-MD-04", totalCopies: 5, availableCopies: 3 },
        ]
    },

    {
        branch: "Mechanical", year: 3, semester: 6, subjectName: "Heat Transfer", subjectCode: "PCC-ME601", category: "Core", credits: "3-1-0",
        description: "Conduction, convection, radiation heat transfer; fins, heat exchangers, boiling, condensation, mass transfer introduction.",
        books: [
            { title: "Heat Transfer", author: "J.P. Holman", publisher: "McGraw-Hill", edition: "10th", ISBN: "978-0-07-352936-4", type: "Textbook", rack: "MECH-3Y-HT-01", totalCopies: 9, availableCopies: 6 },
            { title: "Heat and Mass Transfer", author: "R.K. Rajput", publisher: "S. Chand", edition: "6th", ISBN: "978-81-219-2979-8", type: "Textbook", rack: "MECH-3Y-HT-02", totalCopies: 8, availableCopies: 5 },
            { title: "Fundamentals of Heat and Mass Transfer", author: "F.P. Incropera & D.P. DeWitt", publisher: "Wiley", edition: "7th", ISBN: "978-0-471-45728-2", type: "Textbook", rack: "MECH-3Y-HT-03", totalCopies: 7, availableCopies: 3 },
            { title: "Heat Transfer", author: "Cengel & Ghajar", publisher: "McGraw-Hill", edition: "5th", ISBN: "978-0-07-339818-1", type: "Reference", rack: "MECH-3Y-HT-04", totalCopies: 5, availableCopies: 4 },
        ]
    },

]; // end BPUT_CURRICULUM

// ─── Search Index ─────────────────────────────────────────────────────────────
// Flat array derived from BPUT_CURRICULUM for uniform library search
const BPUT_BOOKS_FLAT = [];
for (const subj of BPUT_CURRICULUM) {
    for (const book of subj.books) {
        BPUT_BOOKS_FLAT.push({
            ...book,
            // subject metadata
            branch: subj.branch,
            year: subj.year,
            semester: subj.semester,
            subjectName: subj.subjectName,
            subjectCode: subj.subjectCode,
            category: subj.category,
            credits: subj.credits,
            // compatibility
            id: book.ISBN.replace(/-/g, ""),
            subject: subj.subjectName,
            shelf: book.rack,
            available: book.availableCopies > 0,
            emoji: _bookEmoji(subj.branch),
        });
    }
}

function _bookEmoji(branch) {
    return { CSE: "💻", ECE: "📡", EE: "⚡", Civil: "🏗️", Mechanical: "⚙️" }[branch] || "📖";
}

// ─── Filter Helpers ───────────────────────────────────────────────────────────
const BPUT_BRANCHES = ["CSE", "ECE", "EE", "Civil", "Mechanical"];
const BPUT_YEARS = [1, 2, 3, 4];

function getBranchSubjects(branch) {
    return BPUT_CURRICULUM.filter(s => s.branch === branch);
}
function getYearSubjects(branch, year) {
    return BPUT_CURRICULUM.filter(s => s.branch === branch && s.year === year);
}
function getSemesterSubjects(branch, year, semester) {
    return BPUT_CURRICULUM.filter(s => s.branch === branch && s.year === year && s.semester === semester);
}
function searchBooks(query) {
    const q = query.toLowerCase();
    return BPUT_BOOKS_FLAT.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.subjectName.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q) ||
        b.branch.toLowerCase().includes(q)
    );
}
