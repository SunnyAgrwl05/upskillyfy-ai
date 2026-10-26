import Assessment from '../models/Assessment.js'

const seedAssessments = [
  {
    slug: 'java-fundamentals',
    title: 'Java Fundamentals',
    description: 'Check your understanding of core Java syntax, types, classes, and object-oriented concepts.',
    category: 'Java and Object-Oriented Programming',
    skills: ['Java', 'OOP', 'Language fundamentals'],
    difficulty: 'Beginner',
    durationMinutes: 15,
    passPercent: 70,
    attemptLimit: 3,
    reviewAnswers: true,
    questions: [
      { prompt: 'Which keyword prevents a class from being subclassed?', type: 'single_choice', options: ['static', 'final', 'private', 'volatile'], correctAnswer: 1, explanation: 'A final class cannot be extended.' },
      { prompt: 'Which statement about method overloading is correct?', type: 'single_choice', options: ['Methods must have different names', 'Methods share a name but differ in parameter lists', 'Only return types must differ', 'Overloading is available only for static methods'], correctAnswer: 1, explanation: 'Overloaded methods share a name and have different parameter lists.' },
      { prompt: 'Which type stores a 64-bit signed integer in Java?', type: 'single_choice', options: ['int', 'short', 'long', 'byte'], correctAnswer: 2, explanation: 'The long primitive type is a signed 64-bit integer.' },
      { prompt: 'Which construct is used to define a contract that classes can implement?', type: 'single_choice', options: ['interface', 'package', 'module', 'record'], correctAnswer: 0, explanation: 'An interface declares a contract that implementing classes provide.' },
    ],
  },
  {
    slug: 'data-structures-basics',
    title: 'Data Structures and Algorithms Basics',
    description: 'Practice complexity analysis and foundational data-structure behavior.',
    category: 'Data Structures and Algorithms',
    skills: ['Big-O', 'Arrays', 'Stacks', 'Hash tables'],
    difficulty: 'Beginner',
    durationMinutes: 20,
    passPercent: 70,
    attemptLimit: 3,
    reviewAnswers: true,
    questions: [
      { prompt: 'What is the time complexity of accessing an array element by index?', type: 'single_choice', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctAnswer: 0, explanation: 'An array index directly identifies the element, so access is constant time.' },
      { prompt: 'Which data structure follows last-in, first-out order?', type: 'single_choice', options: ['Queue', 'Stack', 'Binary search tree', 'Hash map'], correctAnswer: 1, explanation: 'A stack removes the most recently added element first.' },
      { prompt: 'On average, what is the lookup complexity of a well-distributed hash table?', type: 'single_choice', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctAnswer: 0, explanation: 'Average-case hash table lookup is constant time, subject to a good hash distribution.' },
      { prompt: 'Binary search requires which property of its input?', type: 'single_choice', options: ['The input is sorted', 'The input contains unique values', 'The input is a linked list', 'The input has an even length'], correctAnswer: 0, explanation: 'Binary search relies on sorted order to discard half of the search space at each step.' },
    ],
  },
  {
    slug: 'python-programming-basics',
    title: 'Python Programming Basics',
    description: 'Review Python collections, functions, iteration, and basic language behavior.',
    category: 'Python Programming',
    skills: ['Python', 'Collections', 'Functions'],
    difficulty: 'Beginner',
    durationMinutes: 15,
    passPercent: 70,
    attemptLimit: 3,
    reviewAnswers: true,
    questions: [
      { prompt: 'Which Python collection is mutable and ordered?', type: 'single_choice', options: ['tuple', 'list', 'frozenset', 'str'], correctAnswer: 1, explanation: 'Lists preserve order and can be changed after creation.' },
      { prompt: 'What does the `len()` function return for a list?', type: 'single_choice', options: ['The final index', 'The number of elements', 'The number of unique elements', 'The memory size in bytes'], correctAnswer: 1, explanation: '`len()` returns the number of items in a collection.' },
      { prompt: 'Which keyword begins a function definition?', type: 'single_choice', options: ['func', 'function', 'def', 'lambda'], correctAnswer: 2, explanation: 'Named function definitions begin with `def`.' },
      { prompt: 'What is the result of `bool([])`?', type: 'single_choice', options: ['True', 'False', 'None', 'TypeError'], correctAnswer: 1, explanation: 'Empty collections are falsey in Python.' },
    ],
  },
  {
    slug: 'sql-database-fundamentals',
    title: 'SQL and Database Fundamentals',
    description: 'Test relational query basics, filtering, aggregation, and safe data changes.',
    category: 'SQL and Database Management',
    skills: ['SQL', 'Filtering', 'Aggregation'],
    difficulty: 'Beginner',
    durationMinutes: 15,
    passPercent: 70,
    attemptLimit: 3,
    reviewAnswers: true,
    questions: [
      { prompt: 'Which clause filters rows before grouping?', type: 'single_choice', options: ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT'], correctAnswer: 1, explanation: 'WHERE filters individual rows before GROUP BY aggregation.' },
      { prompt: 'Which function counts rows in a SQL query?', type: 'single_choice', options: ['SUM(*)', 'COUNT(*)', 'TOTAL(*)', 'ROWS(*)'], correctAnswer: 1, explanation: '`COUNT(*)` counts the rows returned by the query.' },
      { prompt: 'Which join returns only rows with matching keys on both sides?', type: 'single_choice', options: ['LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'INNER JOIN'], correctAnswer: 3, explanation: 'An INNER JOIN returns rows where the join condition matches on both sides.' },
      { prompt: 'Which statement is used to retrieve data from a table?', type: 'single_choice', options: ['FETCH', 'SELECT', 'PULL', 'READ'], correctAnswer: 1, explanation: '`SELECT` retrieves rows from one or more tables.' },
    ],
  },
]

for (const assessment of seedAssessments) {
  assessment.questions = assessment.questions.map((question) => ({ points: 1, ...question }))
}

export async function ensureSeedAssessments() {
  for (const assessment of seedAssessments) {
    await Assessment.updateOne(
      { slug: assessment.slug },
      { $setOnInsert: assessment },
      { upsert: true, runValidators: true },
    )
  }
}
