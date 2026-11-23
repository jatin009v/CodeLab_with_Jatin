export interface CourseLesson {
  id: string;
  title: string;
}
export interface Chapter {
  title: string;
  lessons: CourseLesson[];
}

const l = (title: string, id: string): CourseLesson => ({ title, id });

export const course: Chapter[] = [
  { title: 'Foundations', lessons: [l('Big-O Notation', 'big-o'), l('Memory & Pointers', 'memory'), l('Recursion', 'recursion'), l('Divide & Conquer', 'divide-and-conquer')] },
  {
    title: 'Arrays & Strings',
    lessons: [
      l('Arrays', 'arrays'),
      l('Dynamic Arrays', 'dynamic-arrays'),
      l('Two Pointers', 'two-pointers'),
      l('Sliding Window', 'sliding-window'),
      l('Prefix Sums', 'prefix-sums'),
      l('Maximum Subarray', 'maximum-subarray'),
      l('Merge Intervals', 'merge-intervals'),
      l('Pattern Matching', 'pattern-matching'),
      l('KMP Search', 'kmp'),
      l('2D Arrays', 'matrices'),
    ],
  },
  {
    title: 'Linked Lists',
    lessons: [
      l('Singly Linked Lists', 'linked-lists'),
      l('Doubly Linked Lists', 'doubly-linked-lists'),
      l('Fast & Slow Pointers', 'fast-slow'),
      l('Reversing a List', 'reversing-a-list'),
      l('Merging Sorted Lists', 'merge-sorted-lists'),
      l('LRU Cache', 'lru-cache'),
    ],
  },
  {
    title: 'Stacks & Queues',
    lessons: [
      l('Stacks', 'stacks'),
      l('Balanced Brackets', 'balanced-brackets'),
      l('Queues', 'queues'),
      l('Circular Buffer', 'circular-buffer'),
      l('Deques', 'deques'),
      l('Monotonic Stack', 'monotonic-stack'),
      l('Monotonic Queue', 'monotonic-queue'),
    ],
  },
  {
    title: 'Hashing',
    lessons: [l('Hash Tables', 'hash-tables'), l('Collision Handling', 'collision-handling'), l('Resizing & Rehashing', 'resizing'), l('Sets & Maps', 'sets-and-maps'), l('Bloom Filters', 'bloom-filters')],
  },
  {
    title: 'Trees',
    lessons: [
      l('Binary Trees', 'binary-trees'),
      l('Tree Traversals', 'tree-traversals'),
      l('Lowest Common Ancestor', 'lowest-common-ancestor'),
      l('Binary Search Trees', 'binary-search-trees'),
      l('BST Deletion', 'bst-deletion'),
      l('Balanced Trees', 'balanced-trees'),
      l('Tries', 'tries'),
      l('Segment Trees', 'segment-trees'),
    ],
  },
  {
    title: 'Heaps',
    lessons: [
      l('Binary Heaps', 'binary-heaps'),
      l('Building a Heap', 'building-a-heap'),
      l('Priority Queues', 'priority-queues'),
      l('Top-K Problems', 'top-k'),
      l('Median of a Stream', 'median-of-a-stream'),
      l('Heap Sort', 'heap-sort'),
    ],
  },
  {
    title: 'Graphs',
    lessons: [
      l('Graph Representation', 'graph-representation'),
      l('Breadth-First Search', 'breadth-first-search'),
      l('Depth-First Search', 'depth-first-search'),
      l('Connected Components', 'connected-components'),
      l('Cycle Detection', 'cycle-detection'),
      l('Topological Sort', 'topological-sort'),
      l('Strongly Connected Components', 'strongly-connected-components'),
      l('Shortest Paths', 'shortest-paths'),
      l('Bellman–Ford', 'bellman-ford'),
      l('Floyd–Warshall', 'floyd-warshall'),
      l('Union-Find', 'union-find'),
      l('Minimum Spanning Trees', 'minimum-spanning-trees'),
      l('Prim’s Algorithm', 'prims-algorithm'),
    ],
  },
  {
    title: 'Sorting & Searching',
    lessons: [
      l('Binary Search', 'binary-search'),
      l('Binary Search on the Answer', 'binary-search-on-answer'),
      l('Simple Sorts', 'simple-sorts'),
      l('Merge Sort', 'merge-sort'),
      l('Quick Sort', 'quick-sort'),
      l('Quickselect', 'quickselect'),
      l('Counting & Radix Sort', 'counting-radix-sort'),
      l('Stability & the Sorting Limit', 'stability-and-limits'),
    ],
  },
  { title: 'Greedy Algorithms', lessons: [l('Interval Scheduling', 'interval-scheduling'), l('Huffman Coding', 'huffman-coding'), l('When Greedy Fails', 'when-greedy-fails')] },
  { title: 'Backtracking', lessons: [l('Subsets', 'subsets'), l('Permutations', 'permutations'), l('N-Queens', 'n-queens'), l('Solving a Maze', 'maze')] },
  {
    title: 'Dynamic Programming',
    lessons: [
      l('Memoization', 'memoization'),
      l('Tabulation', 'tabulation'),
      l('Grid Paths', 'grid-paths'),
      l('Knapsack', 'knapsack'),
      l('Coin Change', 'coin-change'),
      l('Longest Increasing Subsequence', 'longest-increasing-subsequence'),
      l('Sequences', 'sequences'),
      l('Edit Distance', 'edit-distance'),
    ],
  },
  { title: 'Bit Manipulation', lessons: [l('Bits & Masks', 'bits-and-masks'), l('Bit Tricks', 'bit-tricks'), l('Bitsets', 'bitsets')] },
  { title: 'Hard Problems', lessons: [l('P vs NP', 'p-vs-np')] },
];

export const allLessons = course.flatMap((ch, ci) => ch.lessons.map((lesson, li) => ({ ...lesson, chapter: ch, chapterIndex: ci, indexInChapter: li })));
export type LessonRef = (typeof allLessons)[number];

export const findLesson = (id: string) => allLessons.find((x) => x.id === id);
export const pad2 = (n: number) => String(n).padStart(2, '0');
