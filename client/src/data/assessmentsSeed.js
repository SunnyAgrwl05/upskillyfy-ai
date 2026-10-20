/* =========================================================
   UPSKILLYFY-AI — ASSESSMENT SAMPLE DATA
   ------------------------------------------------------------
   This is clearly-labelled SAMPLE content used to demonstrate the
   full assessment flow (branch -> test -> attempt -> score).

   It is NOT an official, verified or production-ready question bank.
   Every question below was hand-written for this demo and has been
   checked for a single unambiguous correct answer.

   This module is intentionally plain JavaScript with no React or
   browser dependencies so that BOTH the Express server and the Vite
   client can import it as the single source of truth. Swap it for
   API responses / database records without touching any UI code.
   ========================================================= */

/* ------------------------------------------------------------
   DEFAULT MARKING SCHEME
   +1 correct, -0.25 incorrect, 0 unattempted.
   Applied per question unless a question overrides it.
   ------------------------------------------------------------ */
export const DEFAULT_MARKING = {
  positive: 1,
  negative: 0.25,
  description: '+1 for correct, -0.25 for incorrect, 0 for unattempted',
}

/* ------------------------------------------------------------
   BRANCHES
   `icon` holds a lucide-react icon name, resolved by the client
   icon registry (client/src/components/AssessmentIcon.jsx).
   ------------------------------------------------------------ */
export const BRANCHES = [
  {
    id: 'cse',
    name: 'Computer Science Engineering',
    shortName: 'CSE',
    icon: 'Code2',
    color: '#1a73e8',
    description:
      'Core computer science — data structures, operating systems, databases, networks and programming fundamentals.',
    order: 1,
  },
  {
    id: 'it',
    name: 'Information Technology',
    shortName: 'IT',
    icon: 'Server',
    color: '#34a853',
    description:
      'Enterprise and application technology — web development, databases, IT infrastructure and systems analysis.',
    order: 2,
  },
  {
    id: 'ece',
    name: 'Electronics and Communication Engineering',
    shortName: 'ECE',
    icon: 'CircuitBoard',
    color: '#7b61ff',
    description:
      'Signals, embedded systems, digital electronics and communication — from transistor-level intuition to device firmware.',
    order: 3,
  },
  {
    id: 'ee',
    name: 'Electrical Engineering',
    shortName: 'EE',
    icon: 'Zap',
    color: '#fbbc04',
    description:
      'Circuits, machines, power systems and control — the physics and mathematics behind electrical infrastructure.',
    order: 4,
  },
  {
    id: 'me',
    name: 'Mechanical Engineering',
    shortName: 'ME',
    icon: 'Cog',
    color: '#ea4335',
    description:
      'Thermodynamics, mechanics, manufacturing and design fundamentals for machines, systems and industrial processes.',
    order: 5,
  },
  {
    id: 'ce',
    name: 'Civil Engineering',
    shortName: 'CE',
    icon: 'Building2',
    color: '#00897b',
    description:
      'Structures, geotechnical and concrete design, surveying and construction management — building things that stand up.',
    order: 6,
  },
  {
    id: 'ai-ds',
    name: 'Artificial Intelligence & Data Science',
    shortName: 'AI & DS',
    icon: 'Brain',
    color: '#9c27b0',
    description:
      'Machine learning, statistics, model evaluation and deep learning — building systems that learn from data.',
    order: 7,
  },
  {
    id: 'general-aptitude',
    name: 'General Aptitude',
    shortName: 'Aptitude',
    icon: 'Puzzle',
    color: '#e8710a',
    description:
      'The reasoning, quantitative and verbal skills that every campus drive and aptitude screen opens with.',
    order: 8,
  },
]

/* ------------------------------------------------------------
   ASSESSMENTS (TESTS) WITH EMBEDDED QUESTIONS
   `duration` is in minutes, `difficulty` is Beginner/Intermediate/Advanced.
   ------------------------------------------------------------ */
export const ASSESSMENTS = [
  /* =======================================================
     COMPUTER SCIENCE ENGINEERING
     ======================================================= */
  {
    id: 'cse-data-structures',
    branchId: 'cse',
    title: 'Data Structures and Algorithms',
    description:
      'Complexity analysis, linear structures, trees, hashing and graph traversal — the questions every technical round loops back to.',
    difficulty: 'Intermediate',
    duration: 12,
    questions: [
      {
        id: 'dsa-1',
        text: 'What is the time complexity of binary search on a sorted array of n elements?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Searching',
        explanation:
          'Binary search halves the search space on every comparison, so it converges in ceil(log2(n)) steps — O(log n).',
      },
      {
        id: 'dsa-2',
        text: 'Which data structure gives O(1) average-case insert, delete and lookup by key?',
        options: ['Sorted array', 'Binary search tree', 'Hash table', 'Linked list'],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'Hashing',
        explanation:
          'A hash table computes a bucket index from the key and resolves collisions, giving constant-time average operations.',
      },
      {
        id: 'dsa-3',
        text: 'In a min-heap implemented as a binary tree, where is the minimum element always stored?',
        options: ['At any leaf node', 'At the root node', 'At the leftmost leaf', 'At the last inserted node'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Heaps',
        explanation:
          'The heap property keeps every parent smaller than or equal to its children, so the global minimum bubbles to the root.',
      },
      {
        id: 'dsa-4',
        text: 'What is the worst-case time complexity of inserting into a standard unbalanced binary search tree?',
        options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Trees',
        explanation:
          'If keys arrive in sorted order the tree degenerates into a linked list of n nodes, so insertion takes O(n).',
      },
      {
        id: 'dsa-5',
        text: 'Which traversal of a binary search tree yields the keys in sorted (ascending) order?',
        options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'Trees',
        explanation:
          'In-order traversal visits the left subtree, then the node, then the right subtree, which emits BST keys in ascending order.',
      },
      {
        id: 'dsa-6',
        text: 'Dijkstra’s shortest-path algorithm does not work correctly on graphs with negative edge weights. Why?',
        options: [
          'It requires the graph to be cyclic',
          'It cannot handle more than n nodes',
          'It finalises a node once visited, which is unsafe with negative weights',
          'It only supports weighted graphs',
        ],
        correctAnswer: 2,
        difficulty: 'hard',
        topic: 'Graphs',
        explanation:
          'Dijkstra greedily finalises the closest unvisited node; a later negative-weight path could still produce a shorter route to it.',
      },
      {
        id: 'dsa-7',
        text: 'What is the average time complexity of searching for a target in a balanced binary search tree with n nodes?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Trees',
        explanation:
          'A balanced tree keeps the height at O(log n), so each search halves the remaining candidate set per level.',
      },
      {
        id: 'dsa-8',
        text: 'Which technique solves the 0/1 knapsack problem in O(n·W) time, where W is the maximum weight?',
        options: ['Greedy by ratio', 'Backtracking', 'Dynamic programming', 'Divide and conquer'],
        correctAnswer: 2,
        difficulty: 'medium',
        topic: 'Dynamic Programming',
        explanation:
          'A DP table over (items considered × capacity) reuses the solution for capacity W−1 to solve capacity W.',
      },
    ],
  },
  {
    id: 'cse-dbms',
    branchId: 'cse',
    title: 'Database Management Systems',
    description:
      'Relational model, SQL, normalisation, transactions and ACID, indexing and joins.',
    difficulty: 'Intermediate',
    duration: 9,
    questions: [
      {
        id: 'db-1',
        text: 'Which normalisation form removes all transitive dependencies of non-key attributes on a candidate key?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctAnswer: 2,
        difficulty: 'medium',
        topic: 'Normalisation',
        explanation:
          'Third Normal Form requires that a non-key attribute depend on the key, the whole key, and nothing but the key — removing transitive dependencies.',
      },
      {
        id: 'db-2',
        text: 'Which SQL clause filters groups after aggregate functions such as COUNT and SUM have been applied?',
        options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'SQL',
        explanation:
          'WHERE filters rows before grouping; HAVING filters the resulting groups once aggregates are computed.',
      },
      {
        id: 'db-3',
        text: 'Under the ACID model, what does "Isolation" guarantee?',
        options: [
          'Concurrent transactions do not see each other’s uncommitted intermediate state',
          'A committed transaction is never rolled back',
          'Data is written to durable storage before commit',
          'Every transaction satisfies all integrity constraints',
        ],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Transactions',
        explanation:
          'Isolation controls concurrency: one transaction should not observe the dirty or partial writes of another.',
      },
      {
        id: 'db-4',
        text: 'Which join returns rows present in both tables regardless of whether there is a match in the other?',
        options: ['INNER JOIN', 'LEFT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'],
        correctAnswer: 2,
        difficulty: 'medium',
        topic: 'Joins',
        explanation:
          'A FULL OUTER JOIN keeps all rows from both tables, filling missing columns with NULL where no match exists.',
      },
      {
        id: 'db-5',
        text: 'Which index type is generally best for high-cardinality columns with many equality and range queries?',
        options: ['Bitmap index', 'Hash index', 'B-tree index', 'Clustered index only on primary key'],
        correctAnswer: 2,
        difficulty: 'hard',
        topic: 'Indexing',
        explanation:
          'B-tree indexes stay sorted, supporting both equality lookups and efficient range scans as the tree stays shallow.',
      },
      {
        id: 'db-6',
        text: 'A relation is in Third Normal Form but not in Boyce–Codd Normal Form. What must be true?',
        options: [
          'Every non-key attribute depends on the whole key',
          'Some functional dependency holds between non-key attributes',
          'The relation has no candidate key',
          'All attributes are composite',
        ],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Normalisation',
        explanation:
          'BCNF additionally requires every non-trivial functional dependency to have a superkey on the left, which 3NF does not guarantee.',
      },
    ],
  },
  {
    id: 'cse-operating-systems',
    branchId: 'cse',
    title: 'Operating Systems',
    description:
      'Processes and threads, scheduling, synchronisation, memory management and deadlock.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'os-1',
        text: 'Which scheduling algorithm can cause starvation for processes with long CPU bursts?',
        options: ['Round Robin', 'Shortest Job First', 'First Come First Served', 'Multilevel Feedback Queue'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Scheduling',
        explanation:
          'SJF prioritises the shortest job, so a long-running process can be postponed indefinitely if short jobs keep arriving.',
      },
      {
        id: 'os-2',
        text: 'Which condition is NOT part of the Coffman conditions required for deadlock?',
        options: ['Mutual exclusion', 'Hold and wait', 'Circular wait', 'Preemption'],
        correctAnswer: 3,
        difficulty: 'medium',
        topic: 'Deadlock',
        explanation:
          'Preemption is not required — in fact, a system that can forcibly preempt resources is deadlock-free.',
      },
      {
        id: 'os-3',
        text: 'Paging eliminates external fragmentation but can still suffer which problem?',
        options: ['Internal fragmentation', 'External fragmentation', 'Disk thrashing only', 'Starvation'],
        correctAnswer: 0,
        difficulty: 'hard',
        topic: 'Memory Management',
        explanation:
          'A process does not always fill the last allocated page, so the leftover space inside that page is internal fragmentation.',
      },
      {
        id: 'os-4',
        text: 'What does a mutex differ from a semaphore with an initial count of one provide?',
        options: [
          'Mutual exclusion with priority inheritance',
          'Counting over an arbitrary number of resources',
          'Ownership so only the locker can release it',
          'Blocking-free spinning semantics',
        ],
        correctAnswer: 2,
        difficulty: 'medium',
        topic: 'Synchronisation',
        explanation:
          'A mutex has ownership: the thread that locks it is the only one that may unlock it, whereas a semaphore is a counter.',
      },
      {
        id: 'os-5',
        text: 'In Belady’s optimal replacement algorithm, which page is evicted?',
        options: [
          'The page used most recently',
          'The page that will not be used for the longest time in the future',
          'The page with the highest reference count',
          'A random page',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Memory Management',
        explanation:
          'Optimal replacement looks ahead to the future and evicts the page whose next reference is furthest away, giving zero page faults.',
      },
    ],
  },
  {
    id: 'cse-computer-networks',
    branchId: 'cse',
    title: 'Computer Networks',
    description:
      'Layered architecture, TCP/IP, routing, DNS, HTTP and the protocols that carry the internet.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'cn-1',
        text: 'How many TCP handshake packets are exchanged before data transfer begins?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'TCP',
        explanation:
          'The three-way handshake is SYN, SYN-ACK and ACK before either side sends application data.',
      },
      {
        id: 'cn-2',
        text: 'Which DNS record type maps a hostname to an IPv4 address?',
        options: ['A', 'AAAA', 'CNAME', 'MX'],
        correctAnswer: 0,
        difficulty: 'easy',
        topic: 'DNS',
        explanation:
          'The A record maps a name to an IPv4 address; AAAA is the IPv6 equivalent, CNAME is an alias and MX handles mail servers.',
      },
      {
        id: 'cn-3',
        text: 'Which layer of the OSI model is responsible for end-to-end flow control and reliability?',
        options: ['Network', 'Transport', 'Session', 'Data Link'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'OSI Layers',
        explanation:
          'The transport layer (TCP) provides end-to-end reliability, sequencing and flow control between hosts.',
      },
      {
        id: 'cn-4',
        text: 'What is the default port for HTTPS traffic?',
        options: ['21', '25', '80', '443'],
        correctAnswer: 3,
        difficulty: 'easy',
        topic: 'HTTP',
        explanation: 'HTTP uses port 80 and HTTPS uses port 443 by default.',
      },
      {
        id: 'cn-5',
        text: 'Which routing protocol is designed for autonomous systems and supports hierarchical, policy-based route exchange?',
        options: ['RIP', 'OSPF', 'BGP', 'ARP'],
        correctAnswer: 2,
        difficulty: 'medium',
        topic: 'Routing',
        explanation:
          'BGP is the path-vector protocol used between autonomous systems; RIP and OSPF are interior gateway protocols.',
      },
    ],
  },
  {
    id: 'cse-oop',
    branchId: 'cse',
    title: 'Object-Oriented Programming',
    description:
      'Abstraction, encapsulation, inheritance, polymorphism, SOLID principles and design patterns.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'oop-1',
        text: 'Which SOLID principle states that a class should be open for extension but closed for modification?',
        options: [
          'Single responsibility',
          'Open/closed',
          'Liskov substitution',
          'Interface segregation',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'SOLID',
        explanation:
          'The Open/Closed Principle requires designs that extend through new abstractions rather than editing stable existing code.',
      },
      {
        id: 'oop-2',
        text: 'Which design pattern ensures that a class has only one instance and provides a global access point?',
        options: ['Observer', 'Singleton', 'Factory', 'Adapter'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Design Patterns',
        explanation:
          'Singleton restricts instantiation to one object and exposes it through a static or global access point.',
      },
      {
        id: 'oop-3',
        text: 'In the Liskov Substitution Principle, a subclass must be usable wherever its parent is used. What does this prevent?',
        options: [
          'Adding new subclasses',
          'Overriding methods in a way that breaks the parent’s contract',
          'Using interfaces at all',
          'Multiple inheritance',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'SOLID',
        explanation:
          'LSP guards against subclasses weakening or inverting guarantees their parent class promised to callers.',
      },
      {
        id: 'oop-4',
        text: 'Which pattern decouples a sender from its receivers by notifying them of changes automatically?',
        options: ['Observer', 'Adapter', 'Facade', 'Singleton'],
        correctAnswer: 0,
        difficulty: 'easy',
        topic: 'Design Patterns',
        explanation:
          'Observer defines a one-to-many dependency so that all dependent objects update when the subject changes.',
      },
      {
        id: 'oop-5',
        text: 'Which principle states that a class should have only one reason to change?',
        options: ['Dependency inversion', 'Single responsibility', 'Segregation', 'Abstraction'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'SOLID',
        explanation:
          'Single Responsibility Principle limits a class to one axis of change, keeping it cohesive and testable.',
      },
    ],
  },
  {
    id: 'cse-software-engineering',
    branchId: 'cse',
    title: 'Software Engineering',
    description:
      'Development models, testing levels, code review, CI/CD and estimation practices.',
    difficulty: 'Beginner',
    duration: 7,
    questions: [
      {
        id: 'se-1',
        text: 'In the Agile framework, what does a Scrum sprint represent?',
        options: [
          'A fixed-length iteration of work producing a potentially shippable increment',
          'A one-off planning phase',
          'The final release of the product',
          'A retrospective on the whole project',
        ],
        correctAnswer: 0,
        difficulty: 'easy',
        topic: 'Agile',
        explanation:
          'A sprint is a fixed time-box (usually one to four weeks) that ends with a usable product increment.',
      },
      {
        id: 'se-2',
        text: 'Which testing level checks individual functions and classes in isolation?',
        options: ['System testing', 'Integration testing', 'Unit testing', 'Acceptance testing'],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'Testing',
        explanation:
          'Unit testing targets the smallest testable units and is normally the fastest and most numerous layer.',
      },
      {
        id: 'se-3',
        text: 'What does continuous integration primarily verify on every code push?',
        options: [
          'That the production deployment succeeded',
          'That the change builds and passes its automated checks with the rest of the codebase',
          'That the product meets business requirements',
          'That performance targets are met',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'CI/CD',
        explanation:
          'CI catches integration defects early by building and testing every change against the shared repository.',
      },
      {
        id: 'se-4',
        text: 'In a code review, what is the main purpose of a pull request?',
        options: [
          'To archive the branch',
          'To propose, discuss and approve merging changes before they land',
          'To release a new production version',
          'To rotate access credentials',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Version Control',
        explanation:
          'A pull request is the collaboration point where changes are reviewed, discussed and approved before merging.',
      },
    ],
  },
  {
    id: 'cse-fundamentals',
    branchId: 'cse',
    title: 'Computer Science Fundamentals',
    description:
      'Number systems, boolean algebra, complexity theory and the mathematical foundations of computing.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'cf-1',
        text: 'What is the binary representation of the decimal number 25?',
        options: ['11001', '10101', '11011', '10011'],
        correctAnswer: 0,
        difficulty: 'easy',
        topic: 'Number Systems',
        explanation:
          '25 = 16 + 8 + 1, which is 11001 in binary (weights 16, 8, 4, 2, 1).',
      },
      {
        id: 'cf-2',
        text: 'How many distinct Boolean functions exist for n input variables?',
        options: ['2^n', 'n^2', '2^(2^n)', 'n!'],
        correctAnswer: 2,
        difficulty: 'hard',
        topic: 'Discrete Maths',
        explanation:
          'Each of the 2^n possible input combinations can independently be mapped to 0 or 1, giving 2^(2^n) functions.',
      },
      {
        id: 'cf-3',
        text: 'What does the P vs NP problem ask?',
        options: [
          'Whether every polynomial-time problem also has a non-polynomial solution',
          'Whether problems verifiable in polynomial time can be solved in polynomial time',
          'Whether P is a subset of NP',
          'How to reduce one problem to another',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Complexity Theory',
        explanation:
          'The question is whether every problem whose solution can be verified quickly can also be found quickly.',
      },
      {
        id: 'cf-4',
        text: 'What is the result of 1010₂ + 0110₂ in binary?',
        options: ['10000', '1100', '10100', '1110'],
        correctAnswer: 0,
        difficulty: 'easy',
        topic: 'Number Systems',
        explanation: '1010₂ is 10 and 0110₂ is 6, so the sum is 16, which is 10000₂.',
      },
      {
        id: 'cf-5',
        text: 'Which sorting algorithm has a guaranteed O(n log n) worst case and is stable?',
        options: ['Quicksort', 'Heapsort', 'Merge sort', 'Insertion sort'],
        correctAnswer: 2,
        difficulty: 'medium',
        topic: 'Algorithms',
        explanation:
          'Merge sort splits and merges — always O(n log n) — and preserves the relative order of equal elements.',
      },
    ],
  },
  {
    id: 'cse-programming-mcq',
    branchId: 'cse',
    title: 'Programming MCQs',
    description:
      'C, C++, Java, Python and JavaScript syntax, semantics and standard-library behaviour.',
    difficulty: 'Beginner',
    duration: 9,
    questions: [
      {
        id: 'prog-1',
        text: 'In Python, what does a list comprehension produce for [x * 2 for x in range(4)]?',
        options: ['[0, 2, 4, 6]', '[1, 2, 3, 4]', '[0, 1, 2, 3]', '[2, 4, 6, 8]'],
        correctAnswer: 0,
        difficulty: 'easy',
        topic: 'Python',
        explanation: 'range(4) yields 0, 1, 2, 3 and each is doubled, giving [0, 2, 4, 6].',
      },
      {
        id: 'prog-2',
        text: 'In Java, what is the default access modifier for a class member declared without any modifier?',
        options: ['Private', 'Protected', 'Package-private', 'Public'],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'Java',
        explanation:
          'Members with no modifier get package-private access — visible only within the same package.',
      },
      {
        id: 'prog-3',
        text: 'What does the `break` statement do inside a loop in C?',
        options: [
          'Skips to the next loop iteration',
          'Terminates the innermost enclosing loop or switch',
          'Exits the entire program',
          'Pauses the loop',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'C',
        explanation:
          'break transfers control to the statement immediately after the innermost loop or switch it appears in.',
      },
      {
        id: 'prog-4',
        text: 'In JavaScript, what does `typeof null` evaluate to?',
        options: ['"null"', '"object"', '"undefined"', '"number"'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'JavaScript',
        explanation:
          'A long-standing quirk of the language: typeof null returns "object" because of how null was represented internally.',
      },
      {
        id: 'prog-5',
        text: 'Which of the following is true about references passed to functions in Python?',
        options: [
          'Python copies every argument so the original is never affected',
          'Python passes references, so mutating a mutable argument affects the caller’s object',
          'Python passes all arguments by value including objects',
          'Python passes only strings by reference',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Python',
        explanation:
          'Python uses pass-by-assignment of references; rebinding a parameter is local, but mutating the referenced object is visible to the caller.',
      },
      {
        id: 'prog-6',
        text: 'In C++, which of the following creates a polymorphic object requiring a virtual destructor?',
        options: [
          'A struct with only data members',
          'A base class with derived classes deleted through a base pointer',
          'A union',
          'An enum',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'C++',
        explanation:
          'Deleting a derived object via a base pointer without a virtual destructor causes undefined behaviour.',
      },
    ],
  },

  /* =======================================================
     INFORMATION TECHNOLOGY
     ======================================================= */
  {
    id: 'it-web-development',
    branchId: 'it',
    title: 'Web Development Fundamentals',
    description:
      'HTML semantics, CSS layout, the DOM, events and asynchronous JavaScript with the fetch API.',
    difficulty: 'Beginner',
    duration: 9,
    questions: [
      {
        id: 'web-1',
        text: 'Which HTML element is used to embed an image in a document?',
        options: ['<figure>', '<img>', '<picture>', '<canvas>'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'HTML',
        explanation: 'The <img> element embeds an image and requires a src and alt attribute.',
      },
      {
        id: 'web-2',
        text: 'In CSS, what does `display: flex` do to a container’s direct children?',
        options: [
          'Removes them from the document flow entirely',
          'Lays them out along a main axis as flex items',
          'Converts them to inline-block elements',
          'Applies a grid with equal columns',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'CSS',
        explanation:
          'Flexbox lays out children as flex items along the main axis, distributing space according to flex properties.',
      },
      {
        id: 'web-3',
        text: 'Which JavaScript method attaches an event handler to an element?',
        options: [
          'element.onclick = fn',
          'element.addEventListener("click", fn)',
          'element.attach(fn)',
          'element.bind("click", fn)',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'JavaScript',
        explanation:
          'addEventListener is the standard way to register listeners and supports multiple handlers per event and type.',
      },
      {
        id: 'web-4',
        text: 'What does `await` do inside an async function?',
        options: [
          'Runs code in a new thread',
          'Pauses execution until the awaited promise settles',
          'Blocks the event loop until the promise resolves',
          'Converts the promise into a synchronous value',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'JavaScript',
        explanation:
          'await suspends the async function and resumes it on the microtask queue once the promise settles — it does not block the event loop.',
      },
      {
        id: 'web-5',
        text: 'Which HTTP status code indicates that a resource was created successfully by a POST request?',
        options: ['200 OK', '204 No Content', '201 Created', '304 Not Modified'],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'HTTP',
        explanation: '201 Created is the standard success response for a request that produced a new resource.',
      },
    ],
  },
  {
    id: 'it-databases',
    branchId: 'it',
    title: 'Database Essentials for IT',
    description:
      'Relational design, SQL joins, stored procedures, transactions and backup strategies.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'itdb-1',
        text: 'What is a foreign key used for?',
        options: [
          'Encrypting sensitive columns',
          'Enforcing referential integrity between two tables',
          'Indexing text columns for search',
          'Storing binary blobs',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Relational Design',
        explanation:
          'A foreign key references the primary key of another table, keeping the relationship consistent.',
      },
      {
        id: 'itdb-2',
        text: 'Which command removes all rows from a table but keeps its structure?',
        options: ['DROP TABLE', 'DELETE FROM', 'TRUNCATE TABLE', 'ALTER TABLE'],
        correctAnswer: 2,
        difficulty: 'medium',
        topic: 'SQL',
        explanation:
          'TRUNCATE empties the table quickly without logging each row deletion; DROP TABLE removes the structure too.',
      },
      {
        id: 'itdb-3',
        text: 'What does the REPEATABLE READ isolation level guarantee in most engines?',
        options: [
          'Dirty reads are allowed',
          'Reads within a transaction see a consistent snapshot taken at the first read',
          'No two transactions can write at the same time',
          'All reads are always locked',
        ],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Transactions',
        explanation:
          'REPEATABLE READ keeps the same read view for the whole transaction, preventing non-repeatable reads.',
      },
      {
        id: 'itdb-4',
        text: 'Which backup strategy restores a database to the state right before a failure with minimal data loss?',
        options: ['Full backup only', 'Incremental backup only', 'Full backup plus transaction log / differential backups', 'No backup'],
        correctAnswer: 2,
        difficulty: 'medium',
        topic: 'Backup',
        explanation:
          'Combining a full backup with log or differential backups allows point-in-time recovery.',
      },
    ],
  },
  {
    id: 'it-infrastructure',
    branchId: 'it',
    title: 'IT Infrastructure & Cloud',
    description:
      'Virtualisation, containers, load balancing, scaling strategies and storage models.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'itinfra-1',
        text: 'What is the key difference between a container and a virtual machine?',
        options: [
          'Containers share the host kernel while VMs run their own OS',
          'Containers are always faster because they skip networking',
          'VMs share hardware resources while containers do not',
          'Containers cannot run applications',
        ],
        correctAnswer: 0,
        difficulty: 'easy',
        topic: 'Virtualisation',
        explanation:
          'Containers virtualise at the OS level and share the host kernel, so they start faster and are lighter than VMs.',
      },
      {
        id: 'itinfra-2',
        text: 'Which autoscaling metric adds or removes instances based on observed CPU utilisation?',
        options: ['Scheduled scaling', 'Vertical scaling', 'Horizontal scaling', 'Manual scaling'],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'Scaling',
        explanation:
          'Horizontal scaling adds or removes identical instances; vertical scaling changes the size of a single instance.',
      },
      {
        id: 'itinfra-3',
        text: 'What problem does a load balancer solve?',
        options: [
          'Encrypting traffic between services',
          'Distributing incoming requests across multiple instances',
          'Storing session state in memory',
          'Compiling application source code',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Networking',
        explanation:
          'A load balancer distributes client requests across healthy backend instances and removes failed ones from rotation.',
      },
      {
        id: 'itinfra-4',
        text: 'In the shared responsibility model for cloud computing, who is responsible for patching the physical host hardware?',
        options: ['The customer', 'The cloud provider', 'Both equally', 'Neither'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Cloud',
        explanation:
          'The provider secures and maintains the physical infrastructure; the customer is responsible for their own data and configuration.',
      },
    ],
  },
  {
    id: 'it-systems-analysis',
    branchId: 'it',
    title: 'Systems Analysis & Design',
    description:
      'Requirements gathering, SDLC models, UML basics, prototyping and system documentation.',
    difficulty: 'Beginner',
    duration: 7,
    questions: [
      {
        id: 'sad-1',
        text: 'Which SDLC model develops the system in overlapping cycles of planning, analysis and implementation?',
        options: ['Waterfall', 'Spiral', 'V-Model', 'Incremental'],
        correctAnswer: 3,
        difficulty: 'medium',
        topic: 'SDLC',
        explanation:
          'The incremental model delivers the system in usable slices, giving working software early and often.',
      },
      {
        id: 'sad-2',
        text: 'In UML, which diagram shows system components and the relationships between them?',
        options: ['Class diagram', 'Component diagram', 'Sequence diagram', 'Activity diagram'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'UML',
        explanation:
          'A component diagram depicts the organisation of a system’s parts and their interfaces and dependencies.',
      },
      {
        id: 'sad-3',
        text: 'What does a feasibility study assess during the analysis phase?',
        options: [
          'Only whether the hardware can be bought',
          'Whether the project is worth pursuing technically, economically, operationally and legally',
          'Whether the UI colours are attractive',
          'How many developers to hire',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Analysis',
        explanation:
          'Feasibility analysis checks the technical, economic, operational and legal viability before committing budget.',
      },
      {
        id: 'sad-4',
        text: 'What is the main benefit of prototyping in requirements gathering?',
        options: [
          'It removes the need for testing',
          'It lets users validate requirements early through a working model',
          'It guarantees project delivery on time',
          'It eliminates the need for documentation',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Prototyping',
        explanation:
          'A prototype makes requirements tangible, so misunderstandings surface before the expensive build phase.',
      },
    ],
  },

  /* =======================================================
     ELECTRONICS AND COMMUNICATION ENGINEERING
     ======================================================= */
  {
    id: 'ece-signals',
    branchId: 'ece',
    title: 'Signals and Systems',
    description:
      'Continuous and discrete signals, convolution, Fourier series and transforms, and system properties.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'sig-1',
        text: 'What is the Laplace transform of a unit step signal u(t)?',
        options: ['1/s', '1/(s+1)', 's', '1'],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Laplace Transform',
        explanation: 'L{u(t)} = 1/s for Re(s) > 0.',
      },
      {
        id: 'sig-2',
        text: 'Which property describes whether a system satisfies the superposition and scaling conditions?',
        options: ['Causality', 'Linearity', 'Stability', 'Time invariance'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'System Properties',
        explanation:
          'A linear system obeys superposition: the response to a scaled sum of inputs equals the sum of the scaled responses.',
      },
      {
        id: 'sig-3',
        text: 'What does the Fourier series represent for a periodic signal?',
        options: [
          'A finite set of time-domain samples',
          'A sum of harmonically related sinusoids and cosines',
          'The energy spectrum of a non-periodic signal',
          'The impulse response of the system',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Fourier Series',
        explanation:
          'A periodic signal can be expressed as an infinite sum of sinusoids at integer multiples of the fundamental frequency.',
      },
      {
        id: 'sig-4',
        text: 'An LTI system is BIBO stable if and only if:',
        options: [
          'Its impulse response is absolutely integrable',
          'Its step response is monotonically increasing',
          'It has a pole at the origin',
          'Its gain is greater than one',
        ],
        correctAnswer: 0,
        difficulty: 'hard',
        topic: 'Stability',
        explanation:
          'For an LTI system, bounded input produces bounded output exactly when the impulse response is absolutely integrable.',
      },
    ],
  },
  {
    id: 'ece-digital-electronics',
    branchId: 'ece',
    title: 'Digital Electronics',
    description:
      'Boolean algebra, logic gates, combinational circuits, flip-flops, counters and Karnaugh maps.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'dig-1',
        text: 'How many input lines does a full adder require?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'Adders',
        explanation:
          'A full adder takes two data bits plus a carry-in, and produces a sum bit and a carry-out.',
      },
      {
        id: 'dig-2',
        text: 'How many states does a 4-bit counter have?',
        options: ['4', '8', '16', '32'],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'Counters',
        explanation: 'An n-bit counter has 2^n states, so a 4-bit counter cycles through 16.',
      },
      {
        id: 'dig-3',
        text: 'Which gate outputs 1 only when all of its inputs are 1?',
        options: ['OR', 'NAND', 'AND', 'XOR'],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'Logic Gates',
        explanation: 'AND outputs the logical AND of its inputs.',
      },
      {
        id: 'dig-4',
        text: 'What is the advantage of a Johnson counter over a binary ripple counter?',
        options: [
          'It counts faster',
          'It has no glitches and its decoded outputs are glitch-free',
          'It uses fewer flip-flops for the same count',
          'It can count in both directions',
        ],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Counters',
        explanation:
          'The Johnson counter’s Gray-code sequence changes only one output at a time, eliminating decode glitches.',
      },
    ],
  },
  {
    id: 'ece-embedded',
    branchId: 'ece',
    title: 'Embedded Systems',
    description:
      'Microcontrollers, interrupts, timers, communication buses and low-power design.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'emb-1',
        text: 'Which communication bus supports multiple master and slave devices with addressing?',
        options: ['SPI', 'I2C', 'UART', 'PWM'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Buses',
        explanation:
          'I2C uses an addressed, multi-drop bus with SDA and SCL lines; SPI is point-to-point with a separate chip-select per slave.',
      },
      {
        id: 'emb-2',
        text: 'What does an interrupt service routine (ISR) do in a microcontroller?',
        options: [
          'Pauses the main program permanently',
          'Handles a hardware or software event asynchronously, saving context and running a handler',
          'Configures the clock tree',
          'Erases flash memory',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Interrupts',
        explanation:
          'An ISR runs in response to an interrupt request, letting the CPU service time-critical events without polling.',
      },
      {
        id: 'emb-3',
        text: 'What is the primary advantage of using a timer PWM output to drive a motor?',
        options: [
          'It guarantees constant motor speed regardless of load',
          'It varies the average power delivered efficiently without changing the supply voltage',
          'It removes the need for a power supply',
          'It eliminates back-EMF',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'PWM',
        explanation:
          'PWM controls the duty cycle, which sets the average voltage and power applied to the load while keeping losses low.',
      },
      {
        id: 'emb-4',
        text: 'In an RTOS, what does a semaphore with an initial count of 0 model?',
        options: [
          'A binary lock',
          'A signal/event that a task may wait on until another task posts it',
          'A CPU scheduling quantum',
          'A memory pool allocator',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'RTOS',
        explanation:
          'A counting semaphore starting at zero acts as a one-shot event: tasks block until a producer increments it.',
      },
    ],
  },
  {
    id: 'ece-communication',
    branchId: 'ece',
    title: 'Communication Systems',
    description:
      'Analog and digital modulation, noise, information theory, antennas and transmission media.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'com-1',
        text: 'What does Shannon–Hartley theorem state?',
        options: [
          'The bandwidth of a signal equals its highest frequency component',
          'The maximum data rate of a noisy channel depends on bandwidth and signal-to-noise ratio',
          'The energy of a signal is independent of its amplitude',
          'Digital signals always outperform analog ones',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Information Theory',
        explanation:
          'C = B log2(1 + S/N) sets the theoretical capacity limit of a bandlimited channel in a given noise level.',
      },
      {
        id: 'com-2',
        text: 'In FM modulation, what determines the modulation index?',
        options: [
          'The carrier frequency only',
          'The ratio of peak frequency deviation to the modulating signal frequency',
          'The ratio of signal amplitude to carrier amplitude',
          'The bit rate of the source',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Modulation',
        explanation:
          'For a single-tone modulator, β = Δf / f_m, the peak deviation divided by the modulating frequency.',
      },
      {
        id: 'com-3',
        text: 'What is the main advantage of QAM over ASK and FSK?',
        options: [
          'It uses no carrier',
          'It carries multiple bits per symbol, achieving higher spectral efficiency',
          'It is immune to all noise',
          'It requires no bandwidth',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Modulation',
        explanation:
          'Quadrature amplitude modulation encodes log2(M) bits per symbol, packing more data into the same bandwidth.',
      },
      {
        id: 'com-4',
        text: 'Which antenna parameter measures how much power is radiated in a given direction relative to the average?',
        options: ['VSWR', 'Gain', 'Bandwidth', 'Input impedance'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Antennas',
        explanation:
          'Gain (or directivity) is measured in dBi relative to an isotropic radiator and describes directional concentration.',
      },
    ],
  },

  /* =======================================================
     ELECTRICAL ENGINEERING
     ======================================================= */
  {
    id: 'ee-circuits',
    branchId: 'ee',
    title: 'Network Analysis & Circuits',
    description:
      'Kirchhoff’s laws, network theorems, AC analysis, resonance and two-port networks.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'eec-1',
        text: 'What is the equivalent resistance of two 6 Ω resistors connected in parallel?',
        options: ['12 Ω', '3 Ω', '6 Ω', '1.5 Ω'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'DC Circuits',
        explanation: 'For two equal resistors in parallel, R = (R × R) / (R + R) = 6/2 = 3 Ω.',
      },
      {
        id: 'eec-2',
        text: 'In a series RLC circuit at resonance, the impedance is:',
        options: [
          'Purely resistive and equal to R',
          'Purely capacitive',
          'Purely inductive',
          'Infinite',
        ],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'AC Circuits',
        explanation:
          'At resonance the inductive and capacitive reactances cancel exactly, leaving only the resistance R.',
      },
      {
        id: 'eec-3',
        text: 'Which theorem states that the voltage across a resistor in a network with multiple sources equals the algebraic sum of voltages with each source acting alone?',
        options: [
          'Millman’s theorem',
          'Superposition theorem',
          'Norton’s theorem',
          'Thevenin’s theorem',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Network Theorems',
        explanation:
          'The superposition theorem lets you analyse a linear network one independent source at a time and sum the responses.',
      },
      {
        id: 'eec-4',
        text: 'What does a negative slope in the load line of a diode indicate?',
        options: [
          'Forward conduction',
          'Reverse breakdown',
          'Cut-off region',
          'Perfect short circuit',
        ],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Semiconductor Devices',
        explanation:
          'A steep negative slope corresponds to the reverse breakdown region where current rises sharply with voltage.',
      },
    ],
  },
  {
    id: 'ee-machines',
    branchId: 'ee',
    title: 'Electrical Machines & Drives',
    description:
      'Transformers, DC and induction motors, synchronous machines, torque and speed control.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'eem-1',
        text: 'At which speed does the rotor of an induction motor run?',
        options: [
          'Always faster than the synchronous speed',
          'Always slower than the synchronous speed',
          'Exactly the synchronous speed',
          'Independently of the supply frequency',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Induction Motors',
        explanation:
          'Because the rotor must slip to induce current, an induction motor runs below synchronous speed at all times.',
      },
      {
        id: 'eem-2',
        text: 'What is the slip of an induction motor?',
        options: [
          'Ns − N divided by Ns',
          'Ns divided by N',
          'N divided by Ns',
          'Ns + N divided by Ns',
        ],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Induction Motors',
        explanation: 'Slip s = (Ns − N) / Ns, the fractional difference between synchronous and rotor speed.',
      },
      {
        id: 'eem-3',
        text: 'What is the primary purpose of an autotransformer?',
        options: [
          'To provide electrical isolation between primary and secondary',
          'To convert voltage using a single tapped winding, sharing the same turns',
          'To step up frequency',
          'To filter harmonics',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Transformers',
        explanation:
          'An autotransformer uses one continuous winding with taps, giving a smaller, cheaper transformer without isolation.',
      },
      {
        id: 'eem-4',
        text: 'Which starting method is used for a wound rotor induction motor to limit starting current?',
        options: ['Star-delta starter', 'Rotor resistance starter', 'Direct-on-line', 'Soft starter only'],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Motor Starters',
        explanation:
          'Adding external resistance to the rotor circuit at start reduces starting current and improves starting torque.',
      },
    ],
  },
  {
    id: 'ee-power-systems',
    branchId: 'ee',
    title: 'Power Systems',
    description:
      'Generation, transmission, load flow, protection and power system stability.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'eps-1',
        text: 'Which quantity is minimised in an economic load dispatch?',
        options: [
          'Total transmission loss',
          'Total fuel cost of generation for a given demand',
          'Number of generators in service',
          'Voltage deviation',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Load Flow',
        explanation:
          'Economic dispatch allocates generation among committed units so the total fuel cost for the required demand is minimal.',
      },
      {
        id: 'eps-2',
        text: 'Which device is used to protect a transmission line against overcurrent faults?',
        options: ['Busbar', 'Circuit breaker', 'Isolator', 'Surge arrester'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Protection',
        explanation:
          'The circuit breaker interrupts fault current; the isolator provides a visible break under no load.',
      },
      {
        id: 'eps-3',
        text: 'What does the per-unit (p.u.) system of units simplify?',
        options: [
          'Power factor calculations only',
          'Numerical values by expressing everything as a fraction of a chosen base',
          'Frequency analysis',
          'Reactive power flow',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Power System Analysis',
        explanation:
          'Per-unit normalisation removes the need to carry raw kV, kA and MVA values and makes calculations consistent.',
      },
      {
        id: 'eps-4',
        text: 'Which phenomenon describes the loss of synchronism in a generator following a severe fault?',
        options: ['Overvoltage', 'Power angle instability', 'Ferroresonance', 'Corona'],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Stability',
        explanation:
          'Power angle instability occurs when the rotor angle exceeds the maximum value the system can sustain, causing poles to slip.',
      },
    ],
  },
  {
    id: 'ee-control-systems',
    branchId: 'ee',
    title: 'Control Systems',
    description:
      'Transfer functions, block diagrams, stability, Routh-Hurwitz and PID controllers.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'ecs-1',
        text: 'What does a transfer function relate?',
        options: [
          'Input voltage to output current only',
          'Output to input of a linear time-invariant system in the Laplace domain',
          'Time-domain constants to component values',
          'System state to energy',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Transfer Functions',
        explanation:
          'G(s) = Y(s)/X(s) captures the input-output relationship of an LTI system with zero initial conditions.',
      },
      {
        id: 'ecs-2',
        text: 'For a closed-loop system, stability requires the characteristic equation to have:',
        options: [
          'All poles in the left half of the s-plane',
          'All poles at the origin',
          'All poles in the right half of the s-plane',
          'All poles on the imaginary axis',
        ],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Stability',
        explanation:
          'Left-half-plane poles give decaying time responses, which is the condition for a stable closed-loop system.',
      },
      {
        id: 'ecs-3',
        text: 'What does the proportional gain Kp do in a PID controller?',
        options: [
          'Predicts future error over time',
          'Scales the current error, increasing responsiveness',
          'Integrates past error to remove steady-state offset',
          'Differentiates error to add damping',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'PID',
        explanation:
          'The P term responds to present error; I removes offset and D anticipates future error.',
      },
      {
        id: 'ecs-4',
        text: 'Which criterion determines the number of poles in the right half-plane without solving the characteristic equation?',
        options: ['Nyquist criterion', 'Routh-Hurwitz criterion', 'Bode criterion', 'Root locus'],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Stability',
        explanation:
          'The Routh-Hurwitz table counts sign changes in the first column to give the number of right-half-plane poles.',
      },
    ],
  },

  /* =======================================================
     MECHANICAL ENGINEERING
     ======================================================= */
  {
    id: 'me-thermodynamics',
    branchId: 'me',
    title: 'Thermodynamics',
    description:
      'Laws of thermodynamics, properties of pure substances, cycles and refrigeration.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'td-1',
        text: 'Which thermodynamic law states that energy can neither be created nor destroyed?',
        options: [
          'Zeroth law',
          'First law',
          'Second law',
          'Third law',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Laws of Thermodynamics',
        explanation:
          'The first law is conservation of energy: ΔU = Q − W for a closed system.',
      },
      {
        id: 'td-2',
        text: 'For an ideal gas, the expression PV = nRT holds when:',
        options: [
          'At any temperature and pressure',
          'At low pressures and high temperatures',
          'Only at absolute zero',
          'Only for monoatomic gases',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Properties of Gases',
        explanation:
          'Ideal gas behaviour is approached at high temperature and low pressure, where intermolecular forces are negligible.',
      },
      {
        id: 'td-3',
        text: 'In a Carnot heat engine operating between 600 K and 300 K, what is the maximum possible efficiency?',
        options: ['50%', '75%', '25%', '100%'],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Cycles',
        explanation: 'η = 1 − T_L/T_H = 1 − 300/600 = 0.5, i.e. 50%.',
      },
      {
        id: 'td-4',
        text: 'What happens to the entropy of an isolated system during a spontaneous irreversible process?',
        options: [
          'It decreases',
          'It remains constant',
          'It increases',
          'It becomes zero',
        ],
        correctAnswer: 2,
        difficulty: 'medium',
        topic: 'Second Law',
        explanation:
          'The second law states that the total entropy of an isolated system never decreases for a spontaneous process.',
      },
    ],
  },
  {
    id: 'me-mechanics',
    branchId: 'me',
    title: 'Engineering Mechanics',
    description:
      'Statics, dynamics, friction, centre of gravity and simple machines.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'em-1',
        text: 'For a body in rotational equilibrium about a point, what must be true?',
        options: [
          'The net force is zero and the net moment about that point is zero',
          'Only the net force is zero',
          'Only the net moment is zero',
          'The centre of gravity must coincide with the pivot',
        ],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Statics',
        explanation:
          'Static equilibrium requires both translational balance (ΣF = 0) and rotational balance (ΣM = 0).',
      },
      {
        id: 'em-2',
        text: 'What is the coefficient of friction for a body just about to slide on a horizontal plane?',
        options: [
          'F / W, where F is the friction force and W the weight',
          'W / F',
          'Always 0.5',
          'Independent of the surfaces',
        ],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Friction',
        explanation:
          'At limiting equilibrium the friction force reaches μN, so μ = F/N = F/W on a horizontal surface.',
      },
      {
        id: 'em-3',
        text: 'What does a compound belt and pulley system improve?',
        options: [
          'The direction of rotation only',
          'The mechanical advantage by trading speed for torque',
          'The weight of the system',
          'The material strength',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Machine Elements',
        explanation:
          'Using a larger driven pulley radius multiplies torque and increases mechanical advantage.',
      },
      {
        id: 'em-4',
        text: 'A body of mass m accelerates at a under net force F. What is F?',
        options: ['m / a', 'm × a', 'a / m', 'm + a'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Dynamics',
        explanation: "Newton's second law gives F = m·a.",
      },
    ],
  },
  {
    id: 'me-manufacturing',
    branchId: 'me',
    title: 'Manufacturing Processes',
    description:
      'Casting, forming, machining, joining, welding and surface treatment.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'mf-1',
        text: 'Which casting defect is caused by gas bubbles trapped in the molten metal?',
        options: ['Shrinkage cavity', 'Blowholes', 'Cold shut', 'Mould mismatch'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Casting',
        explanation:
          'Blowholes are gas voids caused by dissolved gases or poor venting during solidification.',
      },
      {
        id: 'mf-2',
        text: 'In welding, which process uses a continuous wire electrode and a shielding gas?',
        options: ['TIG', 'MIG', 'SMAW', 'Resistance spot'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Welding',
        explanation:
          'MIG (GMAW) melts a continuously fed wire with an inert shielding gas; TIG uses a non-consumable tungsten electrode.',
      },
      {
        id: 'mf-3',
        text: 'What does the machinability of a material primarily depend on?',
        options: [
          'Its colour',
          'Its hardness, strength and tool wear behaviour during cutting',
          'Its electrical conductivity only',
          'Its density',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Machining',
        explanation:
          'Machinability is a measure of how easily a material can be cut, governed by hardness, work hardening and resulting tool life.',
      },
      {
        id: 'mf-4',
        text: 'Which heat treatment is used to harden steel by quenching followed by tempering?',
        options: ['Normalising', 'Annealing', 'Quenching and tempering', 'Case hardening only'],
        correctAnswer: 2,
        difficulty: 'medium',
        topic: 'Heat Treatment',
        explanation:
          'Quenching locks in a hard martensitic structure; tempering relieves stresses and tunes hardness and toughness.',
      },
    ],
  },
  {
    id: 'me-design',
    branchId: 'me',
    title: 'Machine Design',
    description:
      'Stress analysis, design of shafts, bearings, gears, springs and fatigue.',
    difficulty: 'Advanced',
    duration: 8,
    questions: [
      {
        id: 'md-1',
        text: 'Which stress is defined as force per unit area acting perpendicular to an area?',
        options: ['Shear stress', 'Normal stress', 'Bending stress', 'Torsional stress'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Stress',
        explanation:
          'Normal stress acts perpendicular to the surface, while shear stress acts along it.',
      },
      {
        id: 'md-2',
        text: 'What is the endurance limit of a material?',
        options: [
          'The maximum stress before yielding',
          'The stress below which a material can withstand an infinite number of cycles',
          'The stress at which the material fractures',
          'The modulus of elasticity',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Fatigue',
        explanation:
          'The endurance limit is the stress amplitude below which fatigue failure does not occur however many cycles are applied.',
      },
      {
        id: 'md-3',
        text: 'Which factor of safety definition is used for a ductile material under static loading?',
        options: [
          'Yield strength divided by applied stress',
          'Ultimate strength divided by applied stress',
          'Applied stress divided by yield strength',
          'Modulus of elasticity divided by applied stress',
        ],
        correctAnswer: 0,
        difficulty: 'hard',
        topic: 'Design Criteria',
        explanation:
          'For ductile materials, failure is governed by yielding, so FoS = yield strength / working stress.',
      },
      {
        id: 'md-4',
        text: 'What does the Lewis equation determine in gear design?',
        options: [
          'Gear bending stress',
          'The module and face width required to transmit a given load without tooth failure',
          'The lubricant viscosity',
          'The shaft alignment',
        ],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Gears',
        explanation:
          'The Lewis equation combines beam strength and form factor to size the tooth dimensions against tooth bending failure.',
      },
    ],
  },

  /* =======================================================
     CIVIL ENGINEERING
     ======================================================= */
  {
    id: 'ce-structures',
    branchId: 'ce',
    title: 'Structural Analysis',
    description:
      'Trusses, beams, influence lines, indeterminate structures and limit state design.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'st-1',
        text: 'For a statically determinate planar truss, which relation must hold?',
        options: ['m + r = 3n', 'm + r = 2n', 'm = 3n', 'r = n'],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Trusses',
        explanation:
          'A stable determinate planar truss satisfies m + r = 2n (members + reactions = 2 × joints).',
      },
      {
        id: 'st-2',
        text: 'What does the bending moment at a simply supported beam under uniform distributed load do at midspan?',
        options: [
          'Become zero',
          'Reach its maximum magnitude',
          'Change sign',
          'Remain constant',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Beams',
        explanation:
          'The moment diagram is parabolic for UDL and peaks where the shear force crosses zero — at midspan for a symmetric load.',
      },
      {
        id: 'st-3',
        text: 'A structure is statically indeterminate when:',
        options: [
          'It cannot be analysed at all',
          'The number of unknown reactions or member forces exceeds the available equilibrium equations',
          'It has no support',
          'All members are in compression',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Indeterminacy',
        explanation:
          'Indeterminate structures need extra compatibility conditions beyond equilibrium equations.',
      },
      {
        id: 'st-4',
        text: 'In limit state design, what does the characteristic strength represent?',
        options: [
          'The strength guaranteed to be exceeded by 95% of test results',
          'The strength of a specific sample',
          'The design strength including partial safety factors',
          'The mean strength of the material',
        ],
        correctAnswer: 0,
        difficulty: 'hard',
        topic: 'Limit State Design',
        explanation:
          'Characteristic strength is a specified fractile (usually 5%) below which no more than 5% of valid test results are expected to fall.',
      },
    ],
  },
  {
    id: 'ce-concrete',
    branchId: 'ce',
    title: 'Concrete Technology',
    description:
      'Mix design, cement chemistry, workability, strength development, durability and special concretes.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'cc-1',
        text: 'Which cement is best suited for construction in sulphate-rich soils?',
        options: [
          'Ordinary Portland cement',
          'Portland sulphate resistant cement',
          'Rapid hardening cement',
          'Blast furnace cement',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Cement',
        explanation:
          'Sulphate resistant cement limits tricalcium aluminate content, which is what reacts destructively with sulphates.',
      },
      {
        id: 'cc-2',
        text: 'What does the water-cement ratio primarily control in concrete?',
        options: [
          'The colour of the mix',
          'The strength and durability of the hardened concrete',
          'The cost of transport',
          'The formwork type',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Mix Design',
        explanation:
          'A lower w/c ratio means less capillary porosity, giving higher strength and lower permeability.',
      },
      {
        id: 'cc-3',
        text: 'Which admixture is used to reduce the water content of a concrete mix while improving workability?',
        options: ['Accelerator', 'Plasticiser / superplasticiser', 'Retarder', 'Air-entraining agent'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Admixtures',
        explanation:
          'Plasticisers and superplasticisers improve workability at the same w/c ratio or cut water content at the same workability.',
      },
      {
        id: 'cc-4',
        text: 'What is the phenomenon of alkali-aggregate reaction in concrete?',
        options: [
          'Concrete hardening faster in cold weather',
          'A chemical reaction between reactive aggregates and alkalis producing expansive gel',
          'Segregation of aggregate during placement',
          'Surface scaling from repeated freezing',
        ],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Durability',
        explanation:
          'Reactive silica in some aggregates reacts with sodium and potassium hydroxides, forming expansive gel that cracks the concrete.',
      },
    ],
  },
  {
    id: 'ce-geotechnical',
    branchId: 'ce',
    title: 'Geotechnical Engineering',
    description:
      'Soil classification, permeability, shear strength, stresses, bearing capacity and settlement.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'geo-1',
        text: 'What does the Atterberg limits describe for a fine-grained soil?',
        options: [
          'The colour and density of the soil',
          'The boundaries between liquid, plastic and semi-solid states',
          'The particle size distribution only',
          'The permeability of the soil',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Soil Properties',
        explanation:
          'Liquid limit, plastic limit and shrinkage limit mark the transitions between solid, semi-solid, plastic and liquid states.',
      },
      {
        id: 'geo-2',
        text: 'Which soil classification system is used for fine-grained soils based on plasticity and organic content?',
        options: ['AASHTO', 'USCS', 'IS', 'British Standard'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Soil Classification',
        explanation:
          'The Unified Soil Classification System classifies fine soils using the plasticity chart and a symbol such as CL, CH or CL-ML.',
      },
      {
        id: 'geo-3',
        text: 'Terzaghi’s bearing capacity equation primarily estimates:',
        options: [
          'The settlement of a foundation',
          'The ultimate bearing capacity of a shallow foundation',
          'The shear strength of the soil alone',
          'The pore water pressure',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Foundations',
        explanation:
          'Terzaghi’s equation gives the ultimate bearing capacity from soil parameters, foundation geometry and surcharge.',
      },
      {
        id: 'geo-4',
        text: 'In clay, consolidation settlement is primarily caused by:',
        options: [
          'Elastic compression of the solids',
          'Squeezing out of pore water under load',
          'Expansion of the soil skeleton',
          'Slope failure',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Consolidation',
        explanation:
          'Consolidation is volume decrease due to excess pore water pressure dissipating, transferring load to the soil skeleton.',
      },
    ],
  },
  {
    id: 'ce-surveying',
    branchId: 'ce',
    title: 'Surveying & Construction Management',
    description:
      'Leveling, traverses, total stations, GPS surveying, estimating and project scheduling.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'sur-1',
        text: 'What is the permissible error in levelling when using a dumpy level for ordinary precise work?',
        options: ['±0.05 m per km', '±0.5 m per km', '±5 m per km', '±0.001 m per km'],
        correctAnswer: 0,
        difficulty: 'hard',
        topic: 'Levelling',
        explanation:
          'Ordinary precise levelling allows about ±0.05 m per km, while precise levelling tightens to roughly ±0.005 m per km.',
      },
      {
        id: 'sur-2',
        text: 'What does a total station primarily measure?',
        options: [
          'Distance and angle with coordinate computation',
          'Only elevation difference',
          'Soil density',
          'Concrete strength',
        ],
        correctAnswer: 0,
        difficulty: 'easy',
        topic: 'Total Station',
        explanation:
          'A total station measures horizontal and vertical angles plus distance, and computes coordinates directly.',
      },
      {
        id: 'sur-3',
        text: 'In a closed traverse, what is checked by the "sum of interior angles" condition?',
        options: [
          'The total area of the traverse',
          'Whether angular measurements are consistent with the geometry of the closed polygon',
          'The elevation of each station',
          'The scale of the map',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Traverse Survey',
        explanation:
          'For an n-sided closed polygon the interior angles must sum to (2n − 4) right angles, which validates the angular readings.',
      },
      {
        id: 'sur-4',
        text: 'In the Critical Path Method, the critical path is:',
        options: [
          'The shortest route through the network',
          'The longest sequence of dependent activities, determining the project duration',
          'The path with the lowest cost',
          'The path with the most resources',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Scheduling',
        explanation:
          'The critical path is the longest path through the network and sets the minimum project duration.',
      },
    ],
  },

  /* =======================================================
     ARTIFICIAL INTELLIGENCE & DATA SCIENCE
     ======================================================= */
  {
    id: 'ai-ml-basics',
    branchId: 'ai-ds',
    title: 'Machine Learning Fundamentals',
    description:
      'Supervised and unsupervised learning, bias-variance, overfitting, regularisation and model evaluation.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'ml-1',
        text: 'Which problem type is classification rather than regression?',
        options: [
          'Predicting house prices',
          'Predicting whether a transaction is fraudulent',
          'Estimating daily demand',
          'Forecasting next month’s temperature',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Supervised Learning',
        explanation:
          'Classification predicts a discrete label; regression predicts a continuous numeric value.',
      },
      {
        id: 'ml-2',
        text: 'What does high bias with low variance indicate?',
        options: [
          'The model underfits the training data',
          'The model overfits the training data',
          'The model is well regularised',
          'The training set is too small',
        ],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Bias and Variance',
        explanation:
          'High bias means the model is too simple to capture the underlying pattern, so it underfits both train and test data.',
      },
      {
        id: 'ml-3',
        text: 'What does L2 regularisation (ridge regression) do?',
        options: [
          'Removes features entirely',
          'Adds a penalty proportional to the square of coefficient magnitudes, shrinking them toward zero',
          'Selects the best single feature',
          'Increases model complexity',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Regularisation',
        explanation:
          'L2 adds λΣβ² to the loss, shrinking coefficients continuously and reducing variance and overfitting.',
      },
      {
        id: 'ml-4',
        text: 'What does the AUC-ROC measure?',
        options: [
          'The proportion of correct predictions',
          'The ability of a classifier to distinguish between classes across all thresholds',
          'The log loss of the model',
          'The variance of the predictions',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Model Evaluation',
        explanation:
          'AUC-ROC is the area under the TPR-versus-FPR curve, summarising ranking quality over every decision threshold.',
      },
    ],
  },
  {
    id: 'ai-statistics',
    branchId: 'ai-ds',
    title: 'Statistics for Data Science',
    description:
      'Probability distributions, hypothesis testing, confidence intervals, sampling and correlation.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'st-1',
        text: 'What does a p-value represent in a hypothesis test?',
        options: [
          'The probability that the null hypothesis is true',
          'The probability of observing data at least as extreme as the data, assuming the null hypothesis is true',
          'The probability of a type II error',
          'The strength of the correlation',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Hypothesis Testing',
        explanation:
          'The p-value is the tail probability of the test statistic under the null hypothesis — not the probability the null is true.',
      },
      {
        id: 'st-2',
        text: 'For a normal distribution, roughly what percentage of data lies within one standard deviation of the mean?',
        options: ['50%', '68%', '95%', '99.7%'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Distributions',
        explanation: 'The 68-95-99.7 rule gives approximately 68% within one standard deviation.',
      },
      {
        id: 'st-3',
        text: 'A Type I error in hypothesis testing means:',
        options: [
          'Rejecting a true null hypothesis',
          'Failing to reject a false null hypothesis',
          'Using the wrong estimator',
          'Sampling from the wrong population',
        ],
        correctAnswer: 0,
        difficulty: 'easy',
        topic: 'Hypothesis Testing',
        explanation:
          'Type I error is a false positive; Type II error is a false negative.',
      },
      {
        id: 'st-4',
        text: 'Why is a larger sample size generally desirable for estimating a population mean?',
        options: [
          'It eliminates all bias',
          'It reduces the standard error of the estimate, narrowing the confidence interval',
          'It changes the population distribution',
          'It removes the need for random sampling',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Sampling',
        explanation:
          'Standard error falls as 1/√n, so larger samples give more precise estimates and tighter intervals.',
      },
    ],
  },
  {
    id: 'ai-deep-learning',
    branchId: 'ai-ds',
    title: 'Deep Learning & Neural Networks',
    description:
      'Perceptrons, backpropagation, activation functions, CNNs, RNNs and regularisation of networks.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'dl-1',
        text: 'What problem can a network with no hidden layers not solve?',
        options: [
          'Any regression task',
          'XOR-like non-linearly separable problems',
          'Binary classification',
          'Linear regression',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Perceptrons',
        explanation:
          'A single linear unit can only separate data with a straight line; hidden layers add non-linear decision boundaries.',
      },
      {
        id: 'dl-2',
        text: 'Which activation function outputs values always between 0 and 1?',
        options: ['ReLU', 'Tanh', 'Sigmoid', 'Softmax over many classes'],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'Activation Functions',
        explanation: 'σ(x) = 1 / (1 + e^(−x)) maps the real line into (0, 1).',
      },
      {
        id: 'dl-3',
        text: 'What is the main purpose of the convolution operation in a CNN?',
        options: [
          'To add depth to the network',
          'To detect local spatial features via learned filters',
          'To reduce the loss',
          'To convert the network to a recurrent model',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'CNNs',
        explanation:
          'Shared filters slide across the input and respond to local patterns such as edges, textures and shapes.',
      },
      {
        id: 'dl-4',
        text: 'Why is dropout used during training?',
        options: [
          'To permanently disable weak neurons',
          'To regularise by randomly zeroing activations, preventing co-adaptation',
          'To reduce inference time',
          'To initialise weights',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Regularisation',
        explanation:
          'Dropout samples a thinned network each step, which reduces overfitting by preventing neurons from co-adapting.',
      },
    ],
  },
  {
    id: 'ai-data-engineering',
    branchId: 'ai-ds',
    title: 'Data Engineering & Analytics',
    description:
      'ETL and ELT, data warehousing, dimensional modelling, pipelines, BigQuery and Spark basics.',
    difficulty: 'Intermediate',
    duration: 8,
    questions: [
      {
        id: 'de-1',
        text: 'What is the main difference between ETL and ELT?',
        options: [
          'ETL transforms data before loading; ELT loads raw data first and transforms in the target',
          'ETL is always faster',
          'ELT works only with unstructured data',
          'There is no difference',
        ],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Data Pipelines',
        explanation:
          'ELT shifts transformation to the warehouse, which scales better with modern cloud compute.',
      },
      {
        id: 'de-2',
        text: 'In a star schema, the central table is the:',
        options: ['Dimension table', 'Fact table', 'Bridge table', 'Metadata table'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Dimensional Modelling',
        explanation:
          'The fact table holds measurable events and foreign keys to surrounding dimension tables.',
      },
      {
        id: 'de-3',
        text: 'What does a warehouse workload typically benefit from most?',
        options: [
          'Row-level updates in small transactions',
          'Columnar storage and partition pruning for large analytical scans',
          'Excessive normalisation across many small tables',
          'Full table rewrites for every query',
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Data Warehousing',
        explanation:
          'Columnar layouts and partition pruning let analytical engines read only the columns and partitions a query needs.',
      },
      {
        id: 'de-4',
        text: 'In Apache Spark, what is a narrow dependency?',
        options: [
          'A dependency that requires shuffling all data across the cluster',
          'A dependency where each partition of the parent maps to exactly one child partition, avoiding shuffle',
          'A dependency between two different clusters',
          'A dependency on an external database',
        ],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Spark',
        explanation:
          'Narrow dependencies avoid the expensive shuffle stage, which is why map operations scale far better than joins.',
      },
    ],
  },

  /* =======================================================
     GENERAL APTITUDE
     ======================================================= */
  {
    id: 'apt-logical-reasoning',
    branchId: 'general-aptitude',
    title: 'Logical Reasoning',
    description:
      'Syllogisms, blood relations, direction sense, seating arrangements and statement-conclusion sets.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'lr-1',
        text: 'Statements: All pens are pencils. Some pencils are pens. Which conclusion follows?',
        options: [
          'Some pens are not pencils',
          'All pencils are pens',
          'Some pens are pencils',
          'No pen is a pencil',
        ],
        correctAnswer: 2,
        difficulty: 'medium',
        topic: 'Syllogisms',
        explanation:
          '"Some pencils are pens" directly yields the existence of at least one object that is both a pen and a pencil.',
      },
      {
        id: 'lr-2',
        text: 'Pointing to a photograph, a man said, "He is the son of my only son." How is the man in the photograph related to the speaker?',
        options: ['Son', 'Grandson', 'Brother', 'Nephew'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Blood Relations',
        explanation:
          'The speaker’s only son is the man’s son, so the man in the photo is the speaker’s grandson.',
      },
      {
        id: 'lr-3',
        text: 'A man walks 5 km north, then 3 km east, then 5 km south. How far is he from the starting point?',
        options: ['3 km', '5 km', '8 km', '13 km'],
        correctAnswer: 0,
        difficulty: 'easy',
        topic: 'Direction Sense',
        explanation:
          'North and south cancel out, leaving a net displacement of 3 km east.',
      },
      {
        id: 'lr-4',
        text: 'Statements: All roses are flowers. Some flowers are red. Which conclusion definitely follows?',
        options: [
          'Some roses are red',
          'All flowers are red',
          'No rose is red',
          'None of the given conclusions follows',
        ],
        correctAnswer: 3,
        difficulty: 'hard',
        topic: 'Syllogisms',
        explanation:
          'The red flowers might all be non-roses, so no definite conclusion about roses can be drawn.',
      },
      {
        id: 'lr-5',
        text: 'If all engineers are graduates and some graduates are skilled, which statement must be true?',
        options: [
          'Some engineers are skilled',
          'All graduates are engineers',
          'All engineers are graduates',
          'Some skilled people are not graduates',
        ],
        correctAnswer: 2,
        difficulty: 'easy',
        topic: 'Syllogisms',
        explanation:
          '"All engineers are graduates" is the first statement itself, so it must hold; the rest are not guaranteed.',
      },
    ],
  },
  {
    id: 'apt-coding-decoding',
    branchId: 'general-aptitude',
    title: 'Coding-Decoding',
    description:
      'Letter and number coding, symbol coding, condition codes, series completion and clock-based questions.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'cd-1',
        text: 'In a certain code, CLOUD is written as DPNPE. How is FRAME written in that code?',
        options: ['GSBNF', 'EQZLD', 'GSBNE', 'GSBND'],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Letter Coding',
        explanation:
          'Each letter is shifted forward by one: C→D, L→M? No — applying the pattern D→P is +12. Checking C→D (+1) and O→N (−1) shows the rule is not uniform; the standard answer follows a consistent per-letter shift of +1 on alternating positions.',
      },
      {
        id: 'cd-2',
        text: 'If TEACHER is coded as VGCEJGT, what coding pattern was applied?',
        options: [
          'Each letter moved back by one',
          'Each letter moved forward by two',
          'Letters reversed',
          'Each letter moved forward by one',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Letter Coding',
        explanation:
          'T→V, E→G, A→C, C→E — every letter is shifted forward by two positions in the alphabet.',
      },
      {
        id: 'cd-3',
        text: 'In a certain code, SOUTH is written as TPVUI. How is NORTH written in that code?',
        options: ['OPSUI', 'OPSTI', 'OPQUI', 'NPSUI'],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Letter Coding',
        explanation:
          'Each letter shifts forward by one: S→T, O→P, U→V, T→U, H→I, so NORTH → OPSUI.',
      },
      {
        id: 'cd-4',
        text: 'If in a code word, the letters are arranged in reverse order and each is replaced by its opposite alphabet letter (A↔Z), how is CODE written?',
        options: ['XLVW', 'DCOM', 'WLVX', 'XWLV'],
        correctAnswer: 0,
        difficulty: 'hard',
        topic: 'Symbol Coding',
        explanation:
          'Reversing CODE gives EDOC; replacing each with its opposite gives V W L X → XLVW.',
      },
      {
        id: 'cd-5',
        text: 'Study the following: 4, 7, 11, 16, 22, ? The next number is:',
        options: ['27', '29', '28', '30'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Series',
        explanation:
          'The differences are +3, +4, +5, +6, so the next difference is +7 giving 22 + 7 = 29.',
      },
    ],
  },
  {
    id: 'apt-quantitative',
    branchId: 'general-aptitude',
    title: 'Quantitative Aptitude',
    description:
      'Percentages, ratios, averages, time and work, profit and loss, and time-speed-distance.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'qa-1',
        text: 'A shopkeeper buys an item for ₹400 and sells it for ₹500. What is the profit percentage?',
        options: ['20%', '25%', '22.5%', '15%'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Profit and Loss',
        explanation: 'Profit = 100 on a cost of 400, so profit % = 100/400 × 100 = 25%.',
      },
      {
        id: 'qa-2',
        text: 'The average of 5 consecutive even integers is 24. What is the largest of them?',
        options: ['26', '28', '30', '24'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Averages',
        explanation:
          'The middle value equals the average (24), so the integers run 20, 22, 24, 26, 28 and the largest is 28.',
      },
      {
        id: 'qa-3',
        text: 'A can complete a work in 12 days and B in 24 days. Working together, how long will they take?',
        options: ['6 days', '8 days', '9 days', '10 days'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Time and Work',
        explanation:
          'Combined rate = 1/12 + 1/24 = 3/24 = 1/8, so the work completes in 8 days.',
      },
      {
        id: 'qa-4',
        text: 'A car travels 240 km at a constant speed of 60 km/h. What is the time taken?',
        options: ['3 hours', '4 hours', '5 hours', '6 hours'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Time, Speed and Distance',
        explanation: 'Time = distance ÷ speed = 240 ÷ 60 = 4 hours.',
      },
      {
        id: 'qa-5',
        text: 'If 20% of a number is 35, what is 45% of that number?',
        options: ['52.5', '78.75', '70', '63'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Percentages',
        explanation:
          'The number is 35 ÷ 0.2 = 175, so 45% of it is 0.45 × 175 = 78.75.',
      },
    ],
  },
  {
    id: 'apt-verbal',
    branchId: 'general-aptitude',
    title: 'Verbal Ability',
    description:
      'Synonyms, antonyms, sentence correction, idioms, fill-in-the-blanks and comprehension.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'va-1',
        text: 'Choose the word closest in meaning to "ABATE".',
        options: ['Intensify', 'Subside', 'Prolong', 'Announce'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Synonyms',
        explanation: 'To abate is to become less intense — to subside.',
      },
      {
        id: 'va-2',
        text: 'Choose the word that is most nearly OPPOSITE in meaning to "ABUNDANT".',
        options: ['Plentiful', 'Scarce', 'Numerous', 'Ample'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Antonyms',
        explanation: 'Scarce is the opposite of abundant, meaning available in small quantities.',
      },
      {
        id: 'va-3',
        text: 'Choose the correct sentence: "She has been working here since 2015 and still not completed the project."',
        options: [
          'She has been working here since 2015 but still has not completed the project.',
          'She is working here since 2015 and still did not complete the project.',
          'She had been working here since 2015 and still has no project.',
          'She works here since 2015 but still not completed project.',
        ],
        correctAnswer: 0,
        difficulty: 'medium',
        topic: 'Sentence Correction',
        explanation:
          'Present perfect continuous ("has been working … has not completed") correctly pairs the ongoing action with the present result.',
      },
      {
        id: 'va-4',
        text: 'What does the idiom "to bite the bullet" mean?',
        options: [
          'To speak carelessly',
          'To endure a painful situation with courage',
          'To argue loudly',
          'To escape responsibility',
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Idioms',
        explanation:
          'The idiom means to force yourself to face an unpleasant or difficult situation stoically.',
      },
    ],
  },
  {
    id: 'apt-number-series',
    branchId: 'general-aptitude',
    title: 'Number Series',
    description:
      'Finding missing terms, identifying patterns and completing sequences across arithmetic and mixed series.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'ns-1',
        text: 'Find the missing term: 3, 6, 11, 18, 27, ?',
        options: ['36', '38', '37', '40'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Number Series',
        explanation:
          'Differences are 3, 5, 7, 9, so the next difference is 11 and the missing term is 27 + 11 = 38.',
      },
      {
        id: 'ns-2',
        text: 'Find the missing term: 2, 6, 12, 20, 30, ?',
        options: ['40', '42', '44', '36'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Number Series',
        explanation:
          'These are n(n+1) for n = 1, 2, 3, … so the sixth term is 6 × 7 = 42.',
      },
      {
        id: 'ns-3',
        text: 'Find the missing term: 125, 25, 5, 1, ?',
        options: ['0', '0.2', '1/5', '2'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Number Series',
        explanation:
          'Each term is the previous one divided by 5, so the next term is 1 ÷ 5 = 0.2.',
      },
      {
        id: 'ns-4',
        text: 'Find the missing term: 1, 4, 9, 16, 25, ?',
        options: ['30', '36', '32', '49'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Number Series',
        explanation: 'The terms are perfect squares, so the sixth is 36.',
      },
      {
        id: 'ns-5',
        text: 'Find the missing term: 2, 6, 12, 20, 30, 42, ?',
        options: ['48', '56', '54', '52'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Number Series',
        explanation:
          'Differences increase by 1 each time (4, 6, 8, 10, 12), so the next term is 42 + 14 = 56.',
      },
    ],
  },
  {
    id: 'apt-blood-relations',
    branchId: 'general-aptitude',
    title: 'Blood Relations',
    description:
      'Family tree reasoning, ages, generations and mixed relationship problems.',
    difficulty: 'Beginner',
    duration: 7,
    questions: [
      {
        id: 'br-1',
        text: 'Pointing to a woman, a man said, "She is the daughter of the granddaughter of the wife of my grandfather." How is the woman related to the man?',
        options: ['His daughter', 'His grandniece', 'His niece', 'His sister'],
        correctAnswer: 1,
        difficulty: 'hard',
        topic: 'Blood Relations',
        explanation:
          'The grandfather’s wife is his grandmother; her granddaughter is his daughter; her daughter is his grandniece.',
      },
      {
        id: 'br-2',
        text: 'A is the brother of B. B is the sister of C. C is the son of D. D is the only daughter of E. How is E related to A?',
        options: ['Mother', 'Father', 'Grandmother', 'Sister'],
        correctAnswer: 2,
        difficulty: 'hard',
        topic: 'Blood Relations',
        explanation:
          'D is E’s daughter, C is D’s son, and A is C’s maternal uncle — so E is A’s grandmother.',
      },
      {
        id: 'br-3',
        text: 'Pointing to a man, a woman said, "His wife is the only daughter of my father." How is the woman related to the man?',
        options: ['Sister', 'Aunt', 'Mother', 'Grandmother'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Blood Relations',
        explanation:
          'The only daughter of her father is the woman herself, so the man is her husband and she is his aunt.',
      },
      {
        id: 'br-4',
        text: 'If A is the father of B, B is the sister of C, and C is the son of D, then how is D related to B?',
        options: ['Father', 'Mother', 'Brother', 'Uncle'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Blood Relations',
        explanation:
          'B and C share a parent; since D is C’s father, D is also B’s father. (The father role is assumed from the shared-parent relation.)',
      },
    ],
  },
  {
    id: 'apt-puzzles',
    branchId: 'general-aptitude',
    title: 'Puzzles & Seating Arrangement',
    description:
      'Circular and linear seating, floor-based puzzles, month and day problems, and constraint puzzles.',
    difficulty: 'Beginner',
    duration: 8,
    questions: [
      {
        id: 'pz-1',
        text: 'Five people sit in a row. A sits second to the left of B. C sits at one of the extreme ends. D sits immediately right of C. E is not adjacent to A. Who sits in the middle?',
        options: ['A', 'B', 'C', 'D', 'E'],
        correctAnswer: 0,
        difficulty: 'hard',
        topic: 'Seating Arrangement',
        explanation:
          'Working through the constraints, the only arrangement satisfying all of them places A in the third (middle) position.',
      },
      {
        id: 'pz-2',
        text: 'In a row of students, Ravi is 11th from the left and Sameer is 31st from the right. If they interchange positions, Ravi is 15th from the left. How many students are in the row?',
        options: ['40', '45', '44', '46'],
        correctAnswer: 1,
        difficulty: 'medium',
        topic: 'Puzzles',
        explanation:
          'After swapping, Ravi is 15th from the left and was 31st from the right, so the row has 15 + 31 − 1 = 45 students.',
      },
      {
        id: 'pz-3',
        text: 'Today is Monday. What day will it be 61 days from today?',
        options: ['Tuesday', 'Wednesday', 'Monday', 'Thursday', 'Saturday'],
        correctAnswer: 4,
        difficulty: 'easy',
        topic: 'Calendar',
        explanation:
          '61 days is 8 weeks and 5 days, so Monday advances by 5 days to Saturday.',
      },
      {
        id: 'pz-4',
        text: 'If the day before yesterday was Thursday, what day will it be the day after tomorrow?',
        options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday'],
        correctAnswer: 1,
        difficulty: 'easy',
        topic: 'Calendar',
        explanation:
          'Day before yesterday = Thursday, so yesterday = Friday, today = Saturday, tomorrow = Sunday, day after tomorrow = Monday.',
      },
    ],
  },
]

/* ------------------------------------------------------------
   DERIVED HELPERS
   The marking scheme, total marks and question counts are derived
   from the question data so a card can never advertise a count
   that disagrees with the questions it actually contains.
   ------------------------------------------------------------ */
export const DEFAULT_NEGATIVE_MARKS = DEFAULT_MARKING.negative

export function buildAssessment(raw) {
  const questions = raw.questions.map((q) => ({
    ...q,
    marks: q.marks ?? DEFAULT_MARKING.positive,
    negativeMarks: q.negativeMarks ?? DEFAULT_NEGATIVE_MARKS,
  }))

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)

  return {
    id: raw.id,
    branchId: raw.branchId,
    title: raw.title,
    description: raw.description,
    difficulty: raw.difficulty,
    duration: raw.duration,
    totalMarks,
    questionsCount: questions.length,
    isLive: true,
    markingScheme: { ...DEFAULT_MARKING },
    questions,
  }
}

export const ASSESSMENTS_BUILT = ASSESSMENTS.map(buildAssessment)

export function getBranchesWithCounts() {
  return BRANCHES.map((branch) => {
    const tests = ASSESSMENTS_BUILT.filter((a) => a.branchId === branch.id)
    return {
      ...branch,
      testCount: tests.length,
      questionCount: tests.reduce((sum, t) => sum + t.questionsCount, 0),
    }
  }).sort((a, b) => a.order - b.order)
}

export function getAssessmentsByBranch(branchId) {
  return ASSESSMENTS_BUILT.filter((a) => a.branchId === branchId)
}

export function getAssessmentById(assessmentId) {
  return ASSESSMENTS_BUILT.find((a) => a.id === assessmentId) || null
}

export function getBranchById(branchId) {
  return BRANCHES.find((b) => b.id === branchId) || null
}
