import { box, edge, slab, tag } from '../iso/build';
import type { SceneObj } from '../iso/types';
import type { Lesson, Step } from './types';

/* ==========================================================================
   Lesson 1: Big-O Notation (Foundations) - Default Landing Page
   ========================================================================== */

function bigOScene(activeTier: 'all' | 'o1' | 'ologn' | 'on' | 'onlogn' | 'on2' | 'summary'): SceneObj[] {
  const objs: SceneObj[] = [
    slab('base', 0, 0, 7.5, 4.2, 0.6, { side: 'COMPLEXITY CLASSES', tray: true }),
    tag('title', [3.75, 4.2, 0.6], 'Growth as N → ∞', { dx: -70, dy: -36, tone: 'dark' }),
  ];

  const towers = [
    { id: 't_o1', x: 0.8, y: 1.5, h: 0.9, label: 'O(1)', name: 'Constant', tone: activeTier === 'o1' ? 'hot' : activeTier === 'all' || activeTier === 'summary' ? 'soft' : 'plain' },
    { id: 't_ologn', x: 2.0, y: 1.5, h: 1.6, label: 'O(log n)', name: 'Logarithmic', tone: activeTier === 'ologn' ? 'hot' : activeTier === 'all' || activeTier === 'summary' ? 'soft' : 'plain' },
    { id: 't_on', x: 3.2, y: 1.5, h: 2.5, label: 'O(n)', name: 'Linear', tone: activeTier === 'on' ? 'hot' : activeTier === 'all' || activeTier === 'summary' ? 'soft' : 'plain' },
    { id: 't_onlogn', x: 4.4, y: 1.5, h: 3.5, label: 'O(n log n)', name: 'Linearithmic', tone: activeTier === 'onlogn' ? 'hot' : activeTier === 'all' || activeTier === 'summary' ? 'soft' : 'plain' },
    { id: 't_on2', x: 5.6, y: 1.5, h: 4.6, label: 'O(n²)', name: 'Quadratic', tone: activeTier === 'on2' ? 'hot' : activeTier === 'all' || activeTier === 'summary' ? 'soft' : 'plain' },
  ];

  towers.forEach((t) => {
    objs.push(
      box(t.id, t.x, t.y, 0.6, t.label, t.tone as any, {
        w: 0.9,
        d: 1.2,
        h: t.h,
        labelSize: 14,
        dot: t.tone === 'hot',
      }),
    );
    if (activeTier === t.id.replace('t_', '') || (activeTier === 'summary' && t.id === 't_o1')) {
      objs.push(tag('tag_' + t.id, [t.x + 0.45, t.y, 0.6 + t.h], t.name, { tone: 'coral', dy: -28 }));
    }
  });

  return objs;
}

const bigOCode = [
  '// Asymptotic notation describes rate of growth',
  'function findElement(arr, target) {',
  '    // O(1): direct array index lookup',
  '    const first = arr[0];',
  '',
  '    // O(n): loop through all n elements',
  '    for (let i = 0; i < arr.length; i++) {',
  '        if (arr[i] === target) return i;',
  '    }',
  '',
  '    // O(n²): nested loops comparing pairs',
  '    for (let i = 0; i < arr.length; i++) {',
  '        for (let j = 0; j < arr.length; j++) {',
  '            checkPair(arr[i], arr[j]);',
  '        }',
  '    }',
  '}',
];

const bigOSteps: Step[] = [
  {
    title: 'The Language of Efficiency',
    tag: 'Concept',
    body: [
      '**Big-O notation** measures how an algorithm’s run time or memory consumption scales as the input size **N** grows arbitrarily large.',
      'Instead of counting actual milliseconds (which change depending on hardware and language), Big-O counts fundamental operations in the **worst-case scenario**.',
    ],
    note: {
      kind: 'picture',
      label: 'Growth rate',
      text: 'Constants and smaller terms are dropped: 3n² + 40n + 100 becomes O(n²), because as n grows, n² dominates completely.',
    },
    lines: [1],
    scene: bigOScene('all'),
    panels: [
      {
        type: 'bars',
        title: 'Operations for N = 1,000',
        sub: 'Notice the exponential growth between classes',
        bars: [
          { label: 'O(1)', suffix: 'Constant', value: '1', frac: 0.03 },
          { label: 'O(log n)', suffix: 'Logarithmic', value: '10', frac: 0.08 },
          { label: 'O(n)', suffix: 'Linear', value: '1,000', frac: 0.25 },
          { label: 'O(n log n)', suffix: 'Linearithmic', value: '10,000', frac: 0.45 },
          { label: 'O(n²)', suffix: 'Quadratic', value: '1,000,000', frac: 0.85 },
        ],
      },
    ],
  },
  {
    title: 'O(1) — Constant Time',
    tag: 'Optimal',
    body: [
      'An operation is **O(1)** if it executes in the same number of steps regardless of whether the collection has 5 items or 500 million items.',
      'Classic examples include reading an array element by index (`arr[i]`), pushing to a stack, or looking up a key in a hash table.',
    ],
    note: {
      kind: 'cost',
      label: 'Time cost',
      text: 'O(1) is the ultimate goal for frequent operations like lookups, insertions, and deletions.',
    },
    lines: [3, 4],
    scene: bigOScene('o1'),
    panels: [
      {
        type: 'rows',
        title: 'O(1) Examples',
        rows: [
          { label: 'Array index access', values: ['arr[0]', 'O(1)'], hot: true },
          { label: 'Stack push / pop', values: ['O(1)'] },
          { label: 'Hash table lookup (avg)', values: ['O(1)'] },
          { label: 'Math calculation', values: ['n * (n+1) / 2', 'O(1)'] },
        ],
      },
    ],
  },
  {
    title: 'O(log n) — Logarithmic Time',
    tag: 'Search',
    body: [
      '**Logarithmic time** algorithms halve the remaining problem space with each decision. If you double the input size, the algorithm only takes **one additional step**.',
      'For an input of N = 1,000,000 items, `log₂(1,000,000) ≈ 20` operations. Binary Search and balanced search tree lookups operate in O(log n).',
    ],
    note: {
      kind: 'picture',
      label: 'Halving',
      text: 'Think of looking up a word in a dictionary: you flip to the middle and immediately eliminate half of all pages.',
    },
    lines: [1, 2],
    scene: bigOScene('ologn'),
    panels: [
      {
        type: 'table',
        title: 'Input Size vs Steps',
        cols: ['Input (N)', 'Linear O(n)', 'Log O(log n)'],
        rows: [
          { cells: ['16', '16 ops', '4 ops'] },
          { cells: ['1,024', '1,024 ops', '10 ops'] },
          { cells: ['1,048,576', '1,048,576 ops', '20 ops'], hot: [2] },
          { cells: ['1,000,000,000', '1 billion', '30 ops'], hot: [2] },
        ],
      },
    ],
  },
  {
    title: 'O(n) — Linear Time',
    tag: 'Iteration',
    body: [
      '**Linear time** means running time increases in direct proportion to the size of the input.',
      'Iterating through every element in an array with a `for` loop, finding the maximum value in an unsorted list, or counting items requires O(n) steps.',
    ],
    note: {
      kind: 'compare',
      label: 'Linear scaling',
      text: 'If N increases tenfold, execution time increases tenfold. Feasible for millions of items within a fraction of a second.',
    },
    lines: [6, 7, 8],
    scene: bigOScene('on'),
    panels: [
      {
        type: 'rows',
        title: 'O(n) Operations',
        rows: [
          { label: 'Linear search', values: ['Search unsorted array'], hot: true },
          { label: 'Array sum / max', values: ['Examine every item'] },
          { label: 'String traversal', values: ['Character by character'] },
          { label: 'Tree traversal (DFS/BFS)', values: ['Visit each node once'] },
        ],
      },
    ],
  },
  {
    title: 'O(n log n) — Linearithmic Time',
    tag: 'Sorting',
    body: [
      '**O(n log n)** is the theoretical speed limit for general comparison-based sorting algorithms like **Merge Sort**, **Quick Sort** (average), and **Heap Sort**.',
      'It represents performing an O(log n) operation for each of the n elements, or dividing a collection into halves log(n) times and doing linear work at each level.',
    ],
    note: {
      kind: 'aside',
      label: 'Sorting barrier',
      text: 'No comparison-based sort can beat O(n log n) in the worst case.',
    },
    lines: [1],
    scene: bigOScene('onlogn'),
    panels: [
      {
        type: 'chips',
        title: 'O(n log n) Algorithms',
        chips: [{ v: 'Merge Sort', state: 'hot' }, { v: 'Quick Sort (avg)' }, { v: 'Heap Sort' }, { v: 'Divide & Conquer' }],
        big: 'n · log₂(n)',
        text: 'Scales comfortably to tens of millions of items in real-world software.',
      },
    ],
  },
  {
    title: 'O(n²) — Quadratic Time',
    tag: 'Caution',
    body: [
      '**Quadratic time** algorithms feature nested loops where every item is compared against every other item. Running time grows with the square of the input size.',
      'For N = 10,000, n² is 100,000,000 operations. While feasible for small inputs, quadratic algorithms quickly stall on large datasets.',
    ],
    note: {
      kind: 'watch',
      label: 'Performance trap',
      text: 'Nested loops (`for i... for j...`) over the same array are the most common source of accidental O(n²) bottlenecks in web apps.',
    },
    lines: [11, 12, 13, 14, 15],
    scene: bigOScene('on2'),
    panels: [
      {
        type: 'rows',
        title: 'Comparison of Scale',
        rows: [
          { label: 'N = 10', values: ['n² = 100 ops'] },
          { label: 'N = 1,000', values: ['n² = 1,000,000 ops'] },
          { label: 'N = 100,000', values: ['n² = 10,000,000,000 ops'], hot: true },
        ],
        foot: 'At N = 100,000, O(n) takes milliseconds while O(n²) takes minutes!',
      },
    ],
  },
  {
    title: 'Summary & Best Practices',
    tag: 'Mastery',
    body: [
      'When designing data structures and algorithms, always analyze both **Time Complexity** (how long it takes) and **Space Complexity** (extra auxiliary memory allocated).',
      'Throughout CodeLab, every lesson displays exact Big-O costs for every operation so you can choose the optimal data structure for any challenge.',
    ],
    note: {
      kind: 'picture',
      label: 'Rule of thumb',
      text: 'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)',
    },
    lines: [1, 3, 6, 11],
    scene: bigOScene('summary'),
    panels: [
      {
        type: 'bars',
        title: 'Complexity Hierarchy (Fastest to Slowest)',
        bars: [
          { label: 'O(1)', suffix: 'Excellent', value: 'Instant', frac: 0.05 },
          { label: 'O(log n)', suffix: 'Great', value: 'Logarithmic', frac: 0.15 },
          { label: 'O(n)', suffix: 'Fair', value: 'Linear', frac: 0.35 },
          { label: 'O(n log n)', suffix: 'Acceptable', value: 'Linearithmic', frac: 0.55 },
          { label: 'O(n²)', suffix: 'Slow', value: 'Quadratic', frac: 0.8 },
          { label: 'O(2ⁿ)', suffix: 'Horrible', value: 'Exponential', frac: 0.98 },
        ],
      },
    ],
  },
];

export const bigO: Lesson = {
  id: 'big-o',
  title: 'Big-O Notation',
  code: bigOCode,
  steps: bigOSteps,
};

/* ==========================================================================
   Lesson 2: Memory & Pointers (Foundations)
   ========================================================================== */

function memoryScene(stage: 'layout' | 'pointer' | 'deref' | 'heap'): SceneObj[] {
  const objs: SceneObj[] = [
    slab('ram', 0, 0, 7.0, 3.8, 0.6, { side: 'MEMORY ARCHITECTURE (RAM)', tray: true }),
  ];

  // 4 contiguous memory cells on the floor
  const cells = [
    { id: 'c0', addr: '0x100', val: '42', desc: 'var a', tone: stage === 'pointer' ? 'soft' : 'plain' },
    { id: 'c1', addr: '0x104', val: '0x100', desc: 'ptr p', tone: stage === 'pointer' || stage === 'deref' ? 'hot' : 'plain' },
    { id: 'c2', addr: '0x108', val: '99', desc: 'var b', tone: 'plain' },
    { id: 'c3', addr: '0x10C', val: 'Heap', desc: 'obj ptr', tone: stage === 'heap' ? 'hot' : 'plain' },
  ];

  cells.forEach((c, i) => {
    const x = 1.0 + i * 1.35;
    objs.push(
      box(c.id, x, 1.2, 0.6, c.val, c.tone as any, {
        w: 1.1,
        d: 1.4,
        h: 0.9,
        labelSize: 15,
        dot: c.tone === 'hot',
      }),
    );
    objs.push(tag('addr_' + c.id, [x + 0.55, 1.2, 0.6], c.addr, { dy: 24, tone: 'dark', size: 11, mono: true }));
    objs.push(tag('name_' + c.id, [x + 0.55, 2.6, 1.5], c.desc, { dy: -32, tone: c.tone === 'hot' ? 'coral' : 'light', size: 12 }));
  });

  if (stage === 'pointer' || stage === 'deref') {
    // Arrow pointing from c1 (ptr) to c0 (val)
    objs.push(edge('ptr_arrow', [2.9, 1.9, 1.5], [2.1, 1.9, 1.5], { arrow: true, tone: 'coral', over: true }));
  }

  return objs;
}

const memoryCode = [
  '// Stack allocation',
  'let a = 42;          // Address: 0x100, Value: 42',
  'let p = &a;          // Address: 0x104, Value: 0x100 (points to a)',
  '',
  '// Dereferencing a pointer',
  'let val = *p;        // Read value stored at address 0x100 -> 42',
  '*p = 100;           // Modify memory at 0x100 -> a is now 100',
  '',
  '// Heap allocation for dynamic structures',
  'let node = new Node(99); // Pointer stored on stack, data on heap',
];

const memorySteps: Step[] = [
  {
    title: 'Bytes, Addresses & Registers',
    tag: 'Hardware',
    body: [
      'Computer memory (RAM) is a vast linear sequence of contiguous byte cells, each identified by a unique numerical **memory address** (e.g. `0x100`).',
      'When a program declares a variable, the runtime allocates space for its type and binds the variable name to that memory address.',
    ],
    note: {
      kind: 'picture',
      label: 'Contiguous grid',
      text: 'A 32-bit integer occupies 4 consecutive bytes. Accessing `0x104` takes the exact same time as `0x900000`.',
    },
    lines: [1, 2],
    scene: memoryScene('layout'),
    panels: [
      {
        type: 'table',
        title: 'Memory Address Map',
        cols: ['Address', 'Variable', 'Value', 'Size'],
        rows: [
          { cells: ['0x100', 'a', '42', '4 bytes'], hot: [2] },
          { cells: ['0x104', 'p', '0x100 (ref)', '8 bytes'] },
          { cells: ['0x108', 'b', '99', '4 bytes'] },
        ],
      },
    ],
  },
  {
    title: 'Pointers & References',
    tag: 'Pointers',
    body: [
      'A **pointer** is a variable whose value is the **memory address** of another variable.',
      'Instead of copying large objects through functions, we pass pointers or references (`&a`), allowing multiple parts of a program to share and mutate the same data efficiently.',
    ],
    note: {
      kind: 'aside',
      label: 'Pointer arithmetic',
      text: 'In languages like C/C++, adding 1 to a pointer advances it by the size of the underlying type (`p + 1` jumps 4 bytes forward).',
    },
    lines: [3],
    scene: memoryScene('pointer'),
    panels: [
      {
        type: 'rows',
        title: 'Pointer Relationship',
        rows: [
          { label: 'Variable a', values: ['At 0x100', 'Value: 42'] },
          { label: 'Pointer p', values: ['At 0x104', 'Stores 0x100'], hot: true },
          { label: 'Points to', values: ['Variable a'] },
        ],
      },
    ],
  },
  {
    title: 'Dereferencing & Mutation',
    tag: 'Operation',
    body: [
      '**Dereferencing** (`*p`) means following the memory address stored in the pointer to inspect or modify the target memory cell.',
      'Changing `*p = 100` alters the value inside `a` directly, because `p` references `a`’s exact memory location.',
    ],
    note: {
      kind: 'watch',
      label: 'Null pointer safety',
      text: 'Attempting to dereference a null or dangling pointer causes memory segmentation faults or null-pointer crashes.',
    },
    lines: [6, 7],
    scene: memoryScene('deref'),
    panels: [
      {
        type: 'chips',
        title: 'Dereference Flow',
        chips: [{ v: 'p = 0x100' }, { v: 'Dereference *p' }, { v: 'Access 0x100', state: 'hot' }, { v: 'Mutate to 100' }],
        big: '*p = 100',
        text: 'Direct in-place memory alteration without creating a copy.',
      },
    ],
  },
  {
    title: 'The Stack vs The Heap',
    tag: 'Architecture',
    body: [
      '**The Stack** stores local function variables, arguments, and return addresses. It is extremely fast, LIFO-ordered, and automatically cleaned up when functions exit.',
      '**The Heap** holds dynamically allocated objects (like linked-list nodes and trees). Memory here persists until explicitly freed or garbage-collected.',
    ],
    note: {
      kind: 'compare',
      label: 'Trade-off',
      text: 'Stack allocation is instantaneous and contiguous; Heap allocation provides dynamic lifetime but requires pointer overhead.',
    },
    lines: [9, 10],
    scene: memoryScene('heap'),
    panels: [
      {
        type: 'table',
        title: 'Stack vs Heap',
        cols: ['Feature', 'Stack Memory', 'Heap Memory'],
        rows: [
          { cells: ['Speed', 'Extremely fast', 'Slightly slower'] },
          { cells: ['Management', 'Automatic (LIFO)', 'Manual / Garbage Collector'] },
          { cells: ['Size', 'Fixed (limited)', 'Flexible (large RAM)'] },
          { cells: ['Data types', 'Primitives, frame pointers', 'Objects, linked nodes, arrays'], hot: [2] },
        ],
      },
    ],
  },
];

export const memory: Lesson = {
  id: 'memory',
  title: 'Memory & Pointers',
  code: memoryCode,
  steps: memorySteps,
};

/* ==========================================================================
   Lesson 3: Recursion (Foundations)
   ========================================================================== */

function recursionScene(depth: number, stateText: string): SceneObj[] {
  const objs: SceneObj[] = [
    slab('base', 0, 0, 5.5, 4.4, 0.6, { side: 'CALL STACK TRACE', tray: true }),
    tag('trace', [2.75, 4.4, 0.6], stateText, { dy: -36, tone: 'coral' }),
  ];

  const frames = [
    { id: 'f1', label: 'fact(1) = 1 [Base]', n: 1 },
    { id: 'f2', label: 'fact(2) = 2 · fact(1)', n: 2 },
    { id: 'f3', label: 'fact(3) = 3 · fact(2)', n: 3 },
    { id: 'f4', label: 'fact(4) = 4 · fact(3)', n: 4 },
  ];

  // Render stack frames up to current depth
  for (let i = 0; i < depth; i++) {
    const f = frames[3 - i];
    const isTop = i === depth - 1;
    objs.push(
      box(f.id, 1.3, 1.4, 0.6 + i * 0.9, f.label, isTop ? 'hot' : 'soft', {
        w: 2.8,
        d: 1.6,
        h: 0.8,
        labelSize: 13,
        dot: isTop,
      }),
    );
  }

  return objs;
}

const recursionCode = [
  'function factorial(n) {',
  '    // 1. Base Case: stops recursion',
  '    if (n <= 1) {',
  '        return 1;',
  '    }',
  '',
  '    // 2. Recursive Case: calls itself with smaller subproblem',
  '    const subproblem = factorial(n - 1);',
  '    const result = n * subproblem;',
  '    return result;',
  '}',
];

const recursionSteps: Step[] = [
  {
    title: 'Anatomy of Recursion',
    tag: 'Concept',
    body: [
      '**Recursion** occurs when a function solves a problem by calling itself with a strictly smaller subproblem until reaching a terminating condition.',
      'Every valid recursive function must have two components: a **Base Case** that returns without making another call, and a **Recursive Case** that moves closer to the base case.',
    ],
    note: {
      kind: 'watch',
      label: 'Infinite recursion',
      text: 'Without a base case, the function calls itself indefinitely until exhausting the call stack, producing a "Stack Overflow" error.',
    },
    lines: [1, 2, 3, 4],
    scene: recursionScene(1, 'Initial call: factorial(4)'),
    panels: [
      {
        type: 'rows',
        title: 'Two Invariants',
        rows: [
          { label: 'Base Case', values: ['if n <= 1 return 1'], hot: true },
          { label: 'Recursive Step', values: ['n * factorial(n - 1)'] },
          { label: 'Progress Guarantee', values: ['n strictly decreases'] },
        ],
      },
    ],
  },
  {
    title: 'Pushing Stack Frames',
    tag: 'Winding',
    body: [
      'When `factorial(4)` executes, it cannot complete immediately because it needs `factorial(3)`. It pauses, and a new stack frame for `factorial(3)` is pushed onto the system call stack.',
      'This continues: `factorial(3)` calls `factorial(2)`, and `factorial(2)` calls `factorial(1)`. Each frame preserves its own local variables in memory.',
    ],
    note: {
      kind: 'picture',
      label: 'Call stack',
      text: 'Memory consumption equals O(depth) auxiliary space on the call stack.',
    },
    lines: [7, 8],
    scene: recursionScene(4, 'Stack deepens: 4 calls pending'),
    panels: [
      {
        type: 'chips',
        title: 'Call Stack Frames (Top to Bottom)',
        chips: [
          { v: 'factorial(1)', state: 'hot' },
          { v: 'factorial(2)', state: 'soft' },
          { v: 'factorial(3)', state: 'soft' },
          { v: 'factorial(4)', state: 'plain' },
        ],
        big: '4 Frames',
        text: 'Waiting for base case resolution at top of stack.',
      },
    ],
  },
  {
    title: 'Hitting the Base Case',
    tag: 'Base Case',
    body: [
      'When `factorial(1)` is invoked, `n <= 1` evaluates to true! The function returns `1` immediately without creating any further calls.',
      'The base case is the anchor that halts recursion and triggers the return phase.',
    ],
    note: {
      kind: 'needs',
      label: 'Anchor',
      text: 'The base case provides the known answer for the smallest possible subproblem.',
    },
    lines: [3, 4],
    scene: recursionScene(4, 'Base reached: factorial(1) returns 1'),
    panels: [
      {
        type: 'rows',
        title: 'Base Return',
        rows: [
          { label: 'Input n', values: ['1'] },
          { label: 'Condition (n <= 1)', values: ['True'], hot: true },
          { label: 'Return value', values: ['1'] },
        ],
      },
    ],
  },
  {
    title: 'Unwinding & Return Values',
    tag: 'Unwinding',
    body: [
      'Now the call stack **unwinds** in reverse order (LIFO). `factorial(1)` returns `1` to `factorial(2)`, which computes `2 * 1 = 2` and pops its frame.',
      'Next, `factorial(3)` receives `2`, computes `3 * 2 = 6`, and returns to `factorial(4)`.',
    ],
    note: {
      kind: 'picture',
      label: 'LIFO evaluation',
      text: 'Results bubble back up through the suspended callers in exact reverse order.',
    },
    lines: [8, 9, 10],
    scene: recursionScene(2, 'Unwinding: factorial(2) returns 2'),
    panels: [
      {
        type: 'table',
        title: 'Return Evaluation Table',
        cols: ['Frame', 'Subproblem', 'Multiplication', 'Result'],
        rows: [
          { cells: ['factorial(1)', 'Base', '1', '1'] },
          { cells: ['factorial(2)', '1', '2 * 1', '2'], hot: [3] },
          { cells: ['factorial(3)', '2', '3 * 2', '6'] },
          { cells: ['factorial(4)', '6', '4 * 6', '24'] },
        ],
      },
    ],
  },
  {
    title: 'Final Computation & Space Cost',
    tag: 'Result',
    body: [
      'Finally, `factorial(4)` receives `6`, calculates `4 * 6 = 24`, and returns the final answer. The call stack is now completely empty.',
      'While elegant, recursive algorithms have an auxiliary space complexity equal to their maximum call stack depth: **O(n)** space.',
    ],
    note: {
      kind: 'cost',
      label: 'Complexity',
      text: 'Time Complexity: O(n) calls. Auxiliary Space Complexity: O(n) call stack frames.',
    },
    lines: [1, 9, 10],
    scene: recursionScene(1, 'Final Result: 24 (Stack Cleaned)'),
    panels: [
      {
        type: 'rows',
        title: 'Recursion Summary',
        rows: [
          { label: 'Total Calls', values: ['4 calls'] },
          { label: 'Max Stack Depth', values: ['4 frames'] },
          { label: 'Time Complexity', values: ['O(n)'] },
          { label: 'Space Complexity', values: ['O(n)'], hot: true },
          { label: 'Final Output', values: ['24'], hot: true },
        ],
      },
    ],
  },
];

export const recursion: Lesson = {
  id: 'recursion',
  title: 'Recursion',
  code: recursionCode,
  steps: recursionSteps,
};
