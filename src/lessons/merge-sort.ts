import { box, slab, tag } from '../iso/build';
import type { SceneObj } from '../iso/types';
import type { Lesson, Step } from './types';

function mergeSortScene(phase: 'input' | 'divide' | 'conquer' | 'sorted'): SceneObj[] {
  const objs: SceneObj[] = [
    slab('base', 0, 0, 8.2, 4.2, 0.5, { side: 'MERGE SORT (DIVIDE & CONQUER)', tray: true }),
  ];

  if (phase === 'input') {
    const raw = ['38', '27', '43', '3', '9', '82'];
    raw.forEach((val, i) => {
      objs.push(
        box('raw_' + i, 1.0 + i * 1.1, 2.0, 0.6, val, 'plain', {
          w: 0.95,
          d: 1.2,
          h: 0.8,
          labelSize: 14,
        }),
      );
    });
    objs.push(tag('t1', [4.1, 2.0, 1.8], 'Unsorted Array: [38, 27, 43, 3, 9, 82]', { dx: -120, dy: -24, tone: 'dark' }));
  } else if (phase === 'divide') {
    ['38', '27', '43'].forEach((val, i) => {
      objs.push(
        box('left_' + i, 0.8 + i * 1.05, 2.6, 1.2, val, 'hot', {
          w: 0.9,
          d: 1.0,
          h: 0.8,
          labelSize: 13,
        }),
      );
    });
    objs.push(tag('t_left', [2.0, 3.8, 1.2], 'Left Half: [38, 27, 43]', { dx: -70, dy: -20, tone: 'coral' }));

    ['3', '9', '82'].forEach((val, i) => {
      objs.push(
        box('right_' + i, 4.6 + i * 1.05, 2.6, 1.2, val, 'soft', {
          w: 0.9,
          d: 1.0,
          h: 0.8,
          labelSize: 13,
        }),
      );
    });
    objs.push(tag('t_right', [5.8, 3.8, 1.2], 'Right Half: [3, 9, 82]', { dx: -70, dy: -20, tone: 'dark' }));
  } else if (phase === 'conquer') {
    ['27', '38', '43'].forEach((val, i) => {
      objs.push(
        box('sorted_left_' + i, 0.8 + i * 1.05, 2.8, 1.4, val, 'soft', {
          w: 0.9,
          d: 1.0,
          h: 0.8,
          labelSize: 13,
        }),
      );
    });

    ['3', '9', '82'].forEach((val, i) => {
      objs.push(
        box('sorted_right_' + i, 4.6 + i * 1.05, 2.8, 1.4, val, 'soft', {
          w: 0.9,
          d: 1.0,
          h: 0.8,
          labelSize: 13,
        }),
      );
    });

    ['3', '9', '27'].forEach((val, i) => {
      objs.push(
        box('merged_' + i, 2.2 + i * 1.2, 1.0, 0.6, val, 'hot', {
          w: 1.0,
          d: 1.0,
          h: 0.8,
          labelSize: 14,
          dot: true,
        }),
      );
    });
    objs.push(tag('t_m', [4.1, 0.9, 1.6], 'Merging smallest items: 3, 9, 27...', { dx: -90, dy: -24, tone: 'coral' }));
  } else {
    const sorted = ['3', '9', '27', '38', '43', '82'];
    sorted.forEach((val, i) => {
      objs.push(
        box('full_' + i, 1.0 + i * 1.1, 1.8, 0.6, val, 'hot', {
          w: 0.95,
          d: 1.2,
          h: 0.8,
          labelSize: 14,
          dot: true,
        }),
      );
    });
    objs.push(tag('t_done', [4.1, 1.8, 1.8], 'Fully Sorted in O(n log n)', { dx: -80, dy: -24, tone: 'coral' }));
  }

  return objs;
}

const mergeSortCode = [
  'def merge_sort(arr):',
  '    if len(arr) <= 1:',
  '        return arr',
  '    mid = len(arr) // 2',
  '    left = merge_sort(arr[:mid])',
  '    right = merge_sort(arr[mid:])',
  '    return merge(left, right)',
  '',
  'def merge(left, right):',
  '    result = []',
  '    i = j = 0',
  '    while i < len(left) and j < len(right):',
  '        if left[i] <= right[j]:',
  '            result.append(left[i]); i += 1',
  '        else:',
  '            result.append(right[j]); j += 1',
  '    result.extend(left[i:])',
  '    result.extend(right[j:])',
  '    return result',
];

const steps: Step[] = [
  {
    title: 'The Divide-and-Conquer Paradigm',
    tag: 'Concept',
    body: [
      'Merge Sort is a classic recursive **Divide-and-Conquer** algorithm invented by John von Neumann in 1945.',
      'It guarantees a worst-case time complexity of **O(n log n)** and is a **stable** sort, making it the bedrock of sorting engines in languages like Java (TimSort) and Python.',
    ],
    lines: [1, 2, 3],
    scene: mergeSortScene('input'),
    panels: [
      {
        type: 'rows',
        title: 'Algorithm Classification',
        rows: [
          { label: 'Paradigm', values: ['Divide and Conquer'] },
          { label: 'Time Complexity', values: ['Θ(n log n) Best, Avg & Worst'] },
          { label: 'Auxiliary Space', values: ['O(n) auxiliary buffer'] },
          { label: 'Stability', values: ['Stable (preserves equal order)'] },
        ],
      },
    ],
  },
  {
    title: 'Divide Phase: Splitting down to singletons',
    tag: 'Divide',
    body: [
      'The array is repeatedly bisected at its midpoint until subproblems reach size 1.',
      'An array of length 1 is trivially sorted by definition. Dividing an array of size n takes log₂(n) recursive levels.',
    ],
    lines: [4, 5, 6],
    scene: mergeSortScene('divide'),
    panels: [
      {
        type: 'rows',
        title: 'Divide Phase Metrics',
        rows: [
          { label: 'Array Size', values: ['n = 6 elements'] },
          { label: 'Recursion Depth', values: ['⌈log₂(6)⌉ = 3 levels'] },
          { label: 'Base Case Condition', values: ['len(subarray) <= 1'] },
        ],
      },
    ],
  },
  {
    title: 'Conquer Phase: Two-Pointer Merge Routine',
    tag: 'Conquer',
    body: [
      'The real magic happens during merge(left, right). We compare the front elements of both sorted halves using two pointers (i and j).',
      'Whichever is smaller is transferred to the merged result. Each merge level across all subproblems takes exactly O(n) time.',
    ],
    lines: [12, 13, 14, 15, 16],
    scene: mergeSortScene('conquer'),
    panels: [
      {
        type: 'rows',
        title: 'Merge Step Active State',
        rows: [
          { label: 'Comparing', values: ['left[0] = 27 vs right[0] = 3'] },
          { label: 'Extracted Item', values: ['3 appended to output'] },
          { label: 'Linear Work per Level', values: ['O(n)'] },
        ],
      },
    ],
  },
  {
    title: 'Complete Resolution & Guaranteed O(n log n)',
    tag: 'Result',
    body: [
      'With log n levels of recursion and O(n) work per level, the total time is strictly O(n log n).',
      'Unlike QuickSort, Merge Sort has no quadratic worst case on already-sorted or pathological input.',
    ],
    lines: [7],
    scene: mergeSortScene('sorted'),
    panels: [
      {
        type: 'rows',
        title: 'Complexity Comparison',
        rows: [
          { label: 'Best Case', values: ['Ω(n log n)'] },
          { label: 'Average Case', values: ['Θ(n log n)'] },
          { label: 'Worst Case', values: ['O(n log n) guaranteed'] },
          { label: 'Space Complexity', values: ['O(n) auxiliary'] },
        ],
      },
    ],
  },
];

export const mergeSort: Lesson = {
  id: 'merge-sort',
  title: 'Merge Sort',
  code: mergeSortCode,
  steps,
};
