import { box, slab, tag } from '../iso/build';
import type { BoxTone, SceneObj } from '../iso/types';
import type { Lesson, Panel } from './types';

const SH = 0.7;
const BS = 0.95;
const BX = (i: number) => 0.3 + i * 1.08;
const PIVOT = 4;

interface State {
  a: number[];
  i?: number;
  j?: number;
  /** Value with a comparison bubble above it. */
  cmp?: { value: number; text: string };
  tone: (v: number) => BoxTone;
}

function scene(s: State): SceneObj[] {
  const objs: SceneObj[] = [slab('shelf', 0, 0, s.a.length * 1.08 + 0.5, 1.7, SH, { ticks: s.a.map((_, k) => ({ x: BX(k) + BS / 2, text: String(k) })) })];
  s.a.forEach((v, k) => objs.push(box('v' + v, BX(k), 0.38, SH, String(v), s.tone(v), { w: BS, d: BS, h: BS })));
  if (s.cmp) {
    const k = s.a.indexOf(s.cmp.value);
    objs.push(tag('cmp', [BX(k) + BS / 2, 0.38 + BS / 2, SH + BS], s.cmp.text, { tone: 'coral', dy: -52, size: 17 }));
  }
  if (s.i !== undefined) objs.push(tag('i', [BX(s.i) + BS / 2, 1.7, 0], 'i', { dy: 46, size: 17 }));
  if (s.j !== undefined) objs.push(tag('j', [BX(s.j) + BS / 2, 1.7, 0], 'j', { dy: 96, size: 17 }));
  return objs;
}

const partitionTone = (placedSmall: number[]) => (v: number): BoxTone => (v === PIVOT ? 'hot' : placedSmall.includes(v) ? 'soft' : 'plain');

function around(pivotIndex: number | null, small: number[], big: number[]): Panel {
  return {
    type: 'rows',
    title: 'Around the pivot',
    rows: [
      { label: 'Pivot', sub: pivotIndex === null ? 'still at the end' : `cell ${pivotIndex}`, values: [String(PIVOT)], hot: true },
      { label: 'Smaller, on its left', values: small.length ? small.map(String) : ['—'] },
      { label: 'Bigger, on its right', values: big.length ? big.map(String) : ['—'] },
    ],
  };
}

const A0 = [7, 2, 8, 3, 5, 1, 6, 4];
const A1 = [2, 7, 8, 3, 5, 1, 6, 4];
const A2 = [2, 3, 1, 7, 5, 8, 6, 4];
const A3 = [2, 3, 1, 4, 5, 8, 6, 7];
const A4 = [1, 2, 3, 4, 5, 6, 7, 8];

export const quickSort: Lesson = {
  id: 'quick-sort',
  title: 'Quick Sort',
  code: [
    'quick_sort(a):',
    '    if a has fewer than 2 items: return',
    '    p ← partition(a)',
    '    quick_sort(everything before p)',
    '    quick_sort(everything after p)',
    '',
    'partition(a):',
    '    pivot ← the last item',
    '    i ← the first cell',
    '    for each item before the pivot, at j:',
    '        if it is smaller than the pivot:',
    '            swap it into cell i, and move i along',
    '    swap the pivot into cell i',
    '    return i',
  ],
  steps: [
    {
      title: 'Pick a pivot',
      tag: 'Partition',
      body: ['Quick sort starts by choosing one item, the **pivot**. The simplest choice is the last one: 4.', 'The goal of the first pass is not to sort everything. It is only to get every item onto the correct side of 4.'],
      lines: [7, 8, 9],
      scene: scene({ a: A0, i: 0, tone: partitionTone([]) }),
      panels: [around(null, [], [])],
    },
    {
      title: 'Smaller ones go left',
      tag: 'Partition',
      body: ['**j** walks along the row. 7 is bigger than 4, so it stays. 2 is smaller: swap it into cell **i**, then move i one cell along.', 'Cell i always marks where the next small item should go.'],
      lines: [10, 11, 12],
      scene: scene({ a: A1, i: 1, j: 1, cmp: { value: 2, text: '2 < 4' }, tone: partitionTone([2]) }),
      panels: [around(null, [2], [7])],
    },
    {
      title: 'Keep scanning',
      tag: 'Partition',
      body: ['8 stays. 3 is small: swap it into cell i. 5 stays. 1 is small: swap. 6 stays.', 'Everything before i is now smaller than the pivot, and everything from i up to the pivot is bigger. Neither side is sorted, and that is fine.'],
      lines: [10, 11, 12],
      scene: scene({ a: A2, i: 3, j: 6, cmp: { value: 1, text: '1 < 4' }, tone: partitionTone([2, 3, 1]) }),
      panels: [around(null, [2, 3, 1], [7, 5, 8, 6])],
    },
    {
      title: 'The pivot drops into place',
      tag: 'Partition',
      body: ['Swap the pivot into cell i. 4 now sits in cell 3, which is exactly where it belongs in the sorted result.', 'It will never move again. One item is finished, and the rest is split into two independent halves.'],
      lines: [13, 14],
      scene: scene({ a: A3, i: 3, cmp: { value: 4, text: 'in place' }, tone: partitionTone([2, 3, 1]) }),
      panels: [around(3, [2, 3, 1], [5, 8, 6, 7])],
    },
    {
      title: 'The same again, each side',
      tag: 'Recurse',
      body: ['Now quick sort calls itself on the left part (2, 3, 1) and on the right part (5, 8, 6, 7). Each picks its own pivot and partitions.', 'Parts of size 0 or 1 are already sorted, so the calls stop there.'],
      lines: [3, 4, 5],
      scene: scene({ a: A4, tone: (v) => (v === PIVOT ? 'hot' : 'soft') }),
      panels: [around(3, [1, 2, 3], [5, 6, 7, 8])],
    },
    {
      title: 'Fast, usually',
      tag: 'Cost',
      body: [
        'When pivots land near the middle, each level of calls does n work and there are about log n levels: **O(n log n)**.',
        'An unlucky pivot (always the smallest or largest) gives O(n²). Picking the pivot at random makes that very unlikely.',
      ],
      note: { kind: 'aside', text: 'Quick sort sorts in place: apart from the call stack it needs no extra array, unlike merge sort.' },
      scene: scene({ a: A4, tone: () => 'soft' }),
      panels: [
        {
          type: 'rows',
          title: 'What it costs',
          rows: [
            { label: 'Typical', values: ['n log n'], hot: true },
            { label: 'Worst case', sub: 'bad pivots', values: ['n²'] },
            { label: 'Extra memory', values: ['log n'] },
          ],
        },
      ],
    },
  ],
};
