import { box, edge, slab, tag } from '../iso/build';
import type { SceneObj } from '../iso/types';
import type { Lesson, Step } from './types';

/* ==========================================================================
   Arrays (Contiguous Memory & Random Access)
   ========================================================================== */

function arrayScene(highlightIndex?: number, insertMode = false): SceneObj[] {
  const objs: SceneObj[] = [
    slab('base', 0, 0, 8.0, 3.8, 0.6, { side: 'ARRAY IN RAM (CONTIGUOUS)', tray: true }),
  ];

  const vals = ['10', '25', '42', '67', '89'];

  vals.forEach((v, i) => {
    const x = 0.8 + i * 1.3;
    const isTarget = i === highlightIndex;
    objs.push(
      box('cell_' + i, x, 1.2, 0.6, v, isTarget ? 'hot' : 'plain', {
        w: 1.1,
        d: 1.3,
        h: 0.85,
        labelSize: 15,
        dot: isTarget,
      }),
    );
    objs.push(tag('idx_' + i, [x + 0.55, 1.2, 0.6], `[${i}]`, { dy: 24, tone: isTarget ? 'coral' : 'dark', size: 12, mono: true }));
    objs.push(tag('mem_' + i, [x + 0.55, 2.5, 1.45], `0x${(100 + i * 4).toString(16)}`, { dy: -30, tone: 'light', size: 10, mono: true }));
  });

  if (insertMode) {
    objs.push(box('new_item', 6.0, 1.2, 1.8, '99', 'hot', { w: 1.1, d: 1.3, h: 0.85 }));
    objs.push(edge('shift_arr', [5.5, 1.8, 1.0], [6.2, 1.8, 1.0], { arrow: true, tone: 'coral', over: true }));
  }

  return objs;
}

const arraysCode = [
  '// Contiguous memory access formula',
  '// address = base_address + index * element_size',
  '',
  '// 1. O(1) Instant Random Access',
  'function getElement(arr, index) {',
  '    return arr[index]; // Instant math calculation',
  '}',
  '',
  '// 2. O(n) Insertion requiring shifts',
  'function insertAt(arr, index, value) {',
  '    for (let i = arr.length; i > index; i--) {',
  '        arr[i] = arr[i - 1]; // Shift right',
  '    }',
  '    arr[index] = value;',
  '}',
];

const arraysSteps: Step[] = [
  {
    title: 'Contiguous Memory Layout',
    tag: 'Structure',
    body: [
      'An **Array** is a collection of elements stored at contiguous (neighboring) memory locations.',
      'Because all elements sit side-by-side and occupy a uniform byte size, accessing an element at index `i` does not require scanning; it is calculated instantly using: `address = base + i * size`.',
    ],
    note: {
      kind: 'picture',
      label: 'Zero-indexing',
      text: 'Index 0 represents an offset of 0 bytes from the base address: `address(arr[0]) = 0x100`.',
    },
    lines: [1, 2],
    scene: arrayScene(),
    panels: [
      {
        type: 'table',
        title: 'Memory Address Calculation',
        cols: ['Index', 'Address Formula', 'Calculated RAM', 'Value'],
        rows: [
          { cells: ['[0]', '0x100 + 0 * 4', '0x100', '10'] },
          { cells: ['[1]', '0x100 + 1 * 4', '0x104', '25'] },
          { cells: ['[2]', '0x100 + 2 * 4', '0x108', '42'], hot: [2] },
          { cells: ['[3]', '0x100 + 3 * 4', '0x10c', '67'] },
          { cells: ['[4]', '0x100 + 4 * 4', '0x110', '89'] },
        ],
      },
    ],
  },
  {
    title: 'O(1) Random Access',
    tag: 'Lookup',
    body: [
      'Reading `arr[2]` performs a single CPU arithmetic instruction: `0x100 + 2 * 4 = 0x108`. The CPU immediately fetches the value `42`.',
      'This guarantees **O(1) Constant Time** access regardless of whether the array has 5 items or 50 million items.',
    ],
    note: {
      kind: 'cost',
      label: 'Time complexity',
      text: 'Reading or writing any index in an array is always O(1).',
    },
    lines: [4, 5, 6],
    scene: arrayScene(2),
    panels: [
      {
        type: 'rows',
        title: 'Access Performance',
        rows: [
          { label: 'Requested Index', values: ['index = 2'] },
          { label: 'Computed Address', values: ['0x108'], hot: true },
          { label: 'Value Found', values: ['42'], hot: true },
          { label: 'Time Complexity', values: ['O(1) Constant'] },
        ],
      },
    ],
  },
  {
    title: 'Insertions & Shifts (O(n))',
    tag: 'Insertion',
    body: [
      'While index lookups are instant, inserting or deleting an item at the beginning or middle of an array requires **shifting all subsequent elements** to maintain contiguous order.',
      'In the worst case (inserting at index 0), all n elements must shift one cell to the right, yielding **O(n)** time.',
    ],
    note: {
      kind: 'watch',
      label: 'Array trade-off',
      text: 'Fast reads: O(1). Slow middle insertions/deletions: O(n).',
    },
    lines: [9, 10, 11, 12, 13],
    scene: arrayScene(3, true),
    panels: [
      {
        type: 'bars',
        title: 'Array Operation Costs',
        bars: [
          { label: 'Index Read arr[i]', suffix: 'O(1)', value: 'Instant', frac: 0.05 },
          { label: 'Append to end', suffix: 'O(1)*', value: 'Amortized', frac: 0.1 },
          { label: 'Insert at middle', suffix: 'O(n)', value: 'Shifts items', frac: 0.65 },
          { label: 'Insert at index 0', suffix: 'O(n)', value: 'Shifts all', frac: 0.95 },
        ],
      },
    ],
  },
];

export const arrays: Lesson = {
  id: 'arrays',
  title: 'Arrays',
  code: arraysCode,
  steps: arraysSteps,
};

/* ==========================================================================
   Two Pointers Technique
   ========================================================================== */

function twoPointersScene(left: number, right: number, sum: number, target = 16): SceneObj[] {
  const objs: SceneObj[] = [
    slab('base', 0, 0, 8.4, 3.8, 0.6, { side: 'TWO POINTERS ON SORTED ARRAY', tray: true }),
  ];

  const nums = [1, 3, 5, 7, 11, 15];

  nums.forEach((v, i) => {
    const x = 0.8 + i * 1.15;
    const isL = i === left;
    const isR = i === right;
    const tone = isL || isR ? 'hot' : 'plain';
    objs.push(
      box('n_' + i, x, 1.2, 0.6, String(v), tone as any, {
        w: 0.95,
        d: 1.3,
        h: 0.85,
        labelSize: 15,
        dot: isL || isR,
      }),
    );
    if (isL) objs.push(tag('tag_l', [x + 0.47, 1.2, 0.6], 'LEFT', { tone: 'coral', dy: 24, size: 11 }));
    if (isR) objs.push(tag('tag_r', [x + 0.47, 2.5, 1.45], 'RIGHT', { tone: 'coral', dy: -30, size: 11 }));
  });

  objs.push(tag('status', [4.2, 3.6, 0.6], `Sum = ${sum} (Target: ${target})`, { tone: sum === target ? 'coral' : 'dark', dy: -24 }));

  return objs;
}

const twoPointersCode = [
  'function twoSumSorted(arr, target) {',
  '    let left = 0;',
  '    let right = arr.length - 1;',
  '',
  '    while (left < right) {',
  '        const currentSum = arr[left] + arr[right];',
  '',
  '        if (currentSum === target) {',
  '            return [left, right]; // Found pair!',
  '        } else if (currentSum < target) {',
  '            left++;  // Sum too small, move left pointer right',
  '        } else {',
  '            right--; // Sum too large, move right pointer left',
  '        }',
  '    }',
  '    return null;',
  '}',
];

const twoPointersSteps: Step[] = [
  {
    title: 'The Two-Pointer Invariant',
    tag: 'Setup',
    body: [
      'The **Two Pointers** pattern solves search problems on sorted arrays in **O(n) time** and **O(1) space**, eliminating the need for an O(n²) nested loop.',
      'We place one pointer (`left`) at the beginning and one pointer (`right`) at the end. We want to find a pair that sums to `16`.',
    ],
    note: {
      kind: 'needs',
      label: 'Sorted requirement',
      text: 'The array MUST be sorted. This ensures that advancing `left` increases the sum, and decreasing `right` decreases the sum.',
    },
    lines: [1, 2, 3],
    scene: twoPointersScene(0, 5, 1 + 15, 16),
    panels: [
      {
        type: 'rows',
        title: 'Initial State',
        rows: [
          { label: 'Left pointer [0]', values: ['Value: 1'] },
          { label: 'Right pointer [5]', values: ['Value: 15'] },
          { label: 'Current Sum', values: ['1 + 15 = 16'], hot: true },
          { label: 'Target', values: ['16'], hot: true },
        ],
      },
    ],
  },
  {
    title: 'Directional Decision',
    tag: 'Decision',
    body: [
      'Suppose our target was `12`. At `left=0 (val 1)` and `right=5 (val 15)`, sum is `16 > 12`.',
      'Because the array is sorted, every other element paired with `right` would also be too large. Therefore, we safely decrement `right` to examine smaller values.',
    ],
    note: {
      kind: 'picture',
      label: 'Monotonicity',
      text: 'If sum < target: increment left. If sum > target: decrement right. Each step discards impossible pairs.',
    },
    lines: [5, 6, 12, 13],
    scene: twoPointersScene(0, 4, 1 + 11, 12),
    panels: [
      {
        type: 'chips',
        title: 'Step Logic',
        chips: [{ v: '1 + 15 = 16 (>12)' }, { v: 'Decrement right', state: 'hot' }, { v: '1 + 11 = 12 (=Target)', state: 'soft' }],
        big: 'O(n) Total Steps',
        text: 'The pointers meet in at most n steps.',
      },
    ],
  },
  {
    title: 'Match Found in O(n) Time',
    tag: 'Success',
    body: [
      'When `currentSum === target`, we immediately return the pair of indices.',
      'By utilizing the sorted order, we scanned the entire search space in a single pass of at most N steps: **O(n) Time** and **O(1) Memory**.',
    ],
    note: {
      kind: 'cost',
      label: 'Efficiency',
      text: 'Nested brute force: O(n²). Two Pointers: O(n). Zero extra memory allocated.',
    },
    lines: [7, 8],
    scene: twoPointersScene(1, 4, 3 + 11, 14),
    panels: [
      {
        type: 'rows',
        title: 'Complexity Comparison',
        rows: [
          { label: 'Brute Force Time', values: ['O(n²) Quadratic'] },
          { label: 'Two Pointers Time', values: ['O(n) Linear'], hot: true },
          { label: 'Space Complexity', values: ['O(1) Auxiliary'], hot: true },
        ],
      },
    ],
  },
];

export const twoPointers: Lesson = {
  id: 'two-pointers',
  title: 'Two Pointers',
  code: twoPointersCode,
  steps: twoPointersSteps,
};

/* ==========================================================================
   Sliding Window Technique
   ========================================================================== */

function slidingWindowScene(start: number, end: number, sum: number, _k = 3): SceneObj[] {
  const objs: SceneObj[] = [
    slab('base', 0, 0, 8.4, 3.8, 0.6, { side: 'SLIDING WINDOW (SIZE K = 3)', tray: true }),
  ];

  const nums = [2, 1, 5, 1, 3, 2];

  nums.forEach((v, i) => {
    const x = 0.8 + i * 1.15;
    const inWindow = i >= start && i <= end;
    objs.push(
      box('w_' + i, x, 1.2, 0.6, String(v), inWindow ? 'hot' : 'plain', {
        w: 0.95,
        d: 1.3,
        h: 0.85,
        labelSize: 15,
        dot: inWindow,
      }),
    );
  });

  // Wire frame indicating window boundary
  const wx = 0.8 + start * 1.15 - 0.08;
  const ww = (end - start + 1) * 1.15 - 0.04;
  objs.push({ kind: 'wire', id: 'window_wire', x: wx, y: 1.1, z: 0.6, w: ww, d: 1.5, h: 1.2 });
  objs.push(tag('win_tag', [wx + ww / 2, 2.6, 1.8], `Window Sum = ${sum}`, { tone: 'coral', dy: -28 }));

  return objs;
}

const slidingWindowCode = [
  'function maxSubarraySum(arr, k) {',
  '    let maxSum = 0;',
  '    let windowSum = 0;',
  '',
  '    // 1. Compute initial window of size k',
  '    for (let i = 0; i < k; i++) {',
  '        windowSum += arr[i];',
  '    }',
  '    maxSum = windowSum;',
  '',
  '    // 2. Slide window: subtract outgoing, add incoming',
  '    for (let i = k; i < arr.length; i++) {',
  '        windowSum += arr[i] - arr[i - k]; // O(1) update!',
  '        maxSum = Math.max(maxSum, windowSum);',
  '    }',
  '    return maxSum;',
  '}',
];

const slidingWindowSteps: Step[] = [
  {
    title: 'The Sliding Window Principle',
    tag: 'Window',
    body: [
      'The **Sliding Window** technique converts repetitive subarray computations from O(n · k) into **O(n) linear time**.',
      'Instead of summing all k elements from scratch at each step, we maintain a running total: **add the new incoming element and subtract the outgoing element**.',
    ],
    note: {
      kind: 'picture',
      label: 'Rolling sum',
      text: '`new_sum = old_sum + incoming - outgoing`. Calculating the next window takes exactly O(1) operations.',
    },
    lines: [4, 5, 6, 7, 8],
    scene: slidingWindowScene(0, 2, 2 + 1 + 5),
    panels: [
      {
        type: 'rows',
        title: 'Initial Window [0..2]',
        rows: [
          { label: 'Elements in window', values: ['2', '1', '5'] },
          { label: 'Initial Sum', values: ['8'], hot: true },
          { label: 'Window size k', values: ['3'] },
        ],
      },
    ],
  },
  {
    title: 'Sliding One Step Right',
    tag: 'Slide',
    body: [
      'We shift the window one position to the right (indices `[1..3]`).',
      'The incoming element is `arr[3] = 1`. The outgoing element is `arr[0] = 2`. New sum = `8 + 1 - 2 = 7`. We update `maxSum = max(8, 7) = 8`.',
    ],
    note: {
      kind: 'cost',
      label: 'Constant update',
      text: 'Notice we did not loop through the 3 window items; we updated the sum in O(1) time.',
    },
    lines: [11, 12, 13],
    scene: slidingWindowScene(1, 3, 1 + 5 + 1),
    panels: [
      {
        type: 'chips',
        title: 'Window Slide Math',
        chips: [{ v: 'Previous: 8' }, { v: '+ Add arr[3] (1)' }, { v: '- Sub arr[0] (2)' }, { v: 'New Sum: 7', state: 'soft' }],
        big: 'max = 8',
        text: 'Zero re-computations of overlapping items.',
      },
    ],
  },
  {
    title: 'Finding the Maximum Subarray',
    tag: 'Max Result',
    body: [
      'On the next step `[2..4]`, incoming is `arr[4] = 3` and outgoing is `arr[1] = 1`. New sum = `7 + 3 - 1 = 9`.',
      '`9` is greater than `8`, so `maxSum` updates to `9`! Continuing through the array yields the global maximum in **O(n) total time**.',
    ],
    note: {
      kind: 'compare',
      label: 'Complexity win',
      text: 'Brute force: O(n · k). Sliding window: O(n). Works for dynamic window sizes as well.',
    },
    lines: [12, 13, 14, 15],
    scene: slidingWindowScene(2, 4, 5 + 1 + 3),
    panels: [
      {
        type: 'rows',
        title: 'Window Summary',
        rows: [
          { label: 'Window [2..4]', values: ['5', '1', '3'] },
          { label: 'Window Sum', values: ['9'], hot: true },
          { label: 'Global Max Sum', values: ['9'], hot: true },
          { label: 'Total Time', values: ['O(n) Linear'] },
        ],
      },
    ],
  },
];

export const slidingWindow: Lesson = {
  id: 'sliding-window',
  title: 'Sliding Window',
  code: slidingWindowCode,
  steps: slidingWindowSteps,
};
