import { box, slab, tag } from '../iso/build';
import type { SceneObj } from '../iso/types';
import type { Lesson, Panel } from './types';

const A = [4, 9, 15, 21, 28, 34, 42, 51, 60];
const TARGET = 34;
const SH = 0.7; // shelf height
const BX = (i: number) => 0.3 + i * 1.02;
const BS = 0.9; // block size

interface State {
  low: number;
  high: number;
  mid?: number;
  /** Indices already ruled out. */
  out: Set<number>;
  found?: boolean;
  looks: number;
  trail: number[];
}

function scene(s: State): SceneObj[] {
  const objs: SceneObj[] = [
    slab('shelf', 0, 0, A.length * 1.02 + 0.5, 1.6, SH, {
      ticks: A.map((_, i) => ({ x: BX(i) + BS / 2, text: String(i), dim: s.out.has(i) })),
      lane: s.low <= s.high ? { from: BX(s.low) - 0.05, to: BX(s.high) + BS + 0.05 } : undefined,
    }),
    slab('target-pad', -3.1, -0.4, 2.2, 2, 0.6, { side: 'TARGET' }),
  ];
  A.forEach((v, i) => {
    const isMid = s.mid === i;
    objs.push(box('a' + i, BX(i), 0.35, SH + (isMid ? 0.55 : 0), String(v), isMid ? 'hot' : s.out.has(i) ? 'dim' : 'plain', { w: BS, d: BS, h: BS }));
  });
  // The target block sits on its pad until the match, then hops onto the found block.
  if (s.found && s.mid !== undefined) objs.push(box('target', BX(s.mid), 0.35, SH + 0.55 + BS + 0.08, String(TARGET), 'plain', { w: BS, d: BS, h: BS }));
  else objs.push(box('target', -2.5, 0.1, 0.6, String(TARGET), 'plain', { w: BS, d: BS, h: BS }));

  if (s.mid !== undefined) {
    const v = A[s.mid];
    const rel = v === TARGET ? '=' : v < TARGET ? '<' : '>';
    const zTop = SH + 0.55 + BS + (s.found ? BS + 0.08 : 0);
    objs.push(tag('cmp', [BX(s.mid) + BS / 2, 0.35 + BS / 2, zTop], `${v} ${rel} ${TARGET}`, { tone: 'coral', dy: -46, size: 17 }));
  }
  if (s.low <= s.high) {
    const same = s.low === s.high;
    objs.push(tag('low', [BX(s.low) + BS / 2, 1.6, 0], 'low', { dy: 52, dx: same ? -30 : 0 }));
    objs.push(tag('high', [BX(s.high) + BS / 2, 1.6, 0], 'high', { dy: same ? 74 : 52, dx: same ? 34 : 0 }));
  }
  return objs;
}

function panels(s: State): Panel[] {
  const left = s.high - s.low + 1;
  return [
    {
      type: 'chips',
      title: 'Search space',
      badge: `${s.looks} look${s.looks === 1 ? '' : 's'}`,
      chips: A.map((v, i) => ({ v: String(v), state: s.mid === i && s.found ? 'hot' : s.mid === i ? 'hot' : s.out.has(i) ? 'dim' : 'soft' })),
      big: String(left),
      text: s.found ? 'left, and it is the one' : `of ${A.length} could be it`,
      trail: s.trail.map(String),
    },
    {
      type: 'bars',
      title: 'How far it stretches',
      sub: 'The most looks binary search can ever need:',
      bars: [
        { label: '9', suffix: 'items', value: '4', frac: 4 / 30 },
        { label: '1,000', suffix: 'items', value: '10', frac: 10 / 30 },
        { label: '1 million', suffix: 'items', value: '20', frac: 20 / 30 },
        { label: '1 billion', suffix: 'items', value: '30', frac: 1 },
      ],
    },
  ];
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const s1: State = { low: 0, high: 8, out: new Set(), looks: 0, trail: [9] };
const s2: State = { ...s1, mid: 4, looks: 1 };
const s3: State = { low: 5, high: 8, out: new Set(range(0, 4)), looks: 1, trail: [9, 4] };
const s4: State = { ...s3, mid: 6, looks: 2 };
const s5: State = { low: 5, high: 5, out: new Set([...range(0, 4), ...range(6, 8)]), looks: 2, trail: [9, 4, 1] };
const s6: State = { ...s5, mid: 5, found: true, looks: 3 };

export const binarySearch: Lesson = {
  id: 'binary-search',
  title: 'Binary Search',
  code: [
    'binary_search(a, target):',
    '    low ← 0, high ← the last index',
    '    while low ≤ high:',
    '        mid ← halfway between low and high',
    '        if a[mid] = target: return mid',
    '        if a[mid] < target:',
    '            low ← mid + 1     // drop the left half',
    '        else:',
    '            high ← mid − 1    // drop the right half',
    '    return not found',
  ],
  steps: [
    {
      title: 'A sorted shelf',
      tag: 'Concept',
      body: ['Nine numbers, in order from smallest to largest. We want to know where **34** is.', 'Checking every block from the left would get there eventually. Because the shelf is sorted, we can do far better.'],
      note: { kind: 'needs', text: 'Binary search only works when the data is sorted.' },
      lines: [1, 2],
      scene: scene(s1),
      panels: panels(s1),
    },
    {
      title: 'Look in the middle',
      tag: 'Compare',
      body: ['Pick the block halfway between low and high: index 4, holding **28**.', '28 is smaller than 34. Since the shelf is sorted, everything to the left of 28 is smaller still.'],
      lines: [3, 4, 5, 6],
      scene: scene(s2),
      panels: panels(s2),
    },
    {
      title: 'Throw away half',
      tag: 'Step',
      body: ['So 34 can only be to the right. Move **low** to index 5. Five blocks are ruled out with a single look.', 'The window of blocks that could still be the answer is now 42, 51, 60 and 34 — four of them.'],
      lines: [6, 7],
      scene: scene(s3),
      panels: panels(s3),
    },
    {
      title: 'Middle again',
      tag: 'Compare',
      body: ['Same move on the smaller window. Halfway between 5 and 8 is index 6: **42**.', 'This time it is too big, so the answer must be on its left.'],
      lines: [3, 4, 5, 6, 8],
      scene: scene(s4),
      panels: panels(s4),
    },
    {
      title: 'And the other side',
      tag: 'Step',
      body: ['Move **high** down to index 5. Low and high now point at the same block.', 'One candidate left. If it is not 34, then 34 is not on the shelf at all.'],
      lines: [8, 9],
      scene: scene(s5),
      panels: panels(s5),
    },
    {
      title: 'Found',
      tag: 'Result',
      body: ['One last look: **34 = 34**. Found at index 5, after three looks.', 'Had it been some other number, the window would have closed with nothing in it, and we would know 34 is not there.'],
      note: { kind: 'compare', text: 'Going one by one from the left would have taken six looks.' },
      lines: [5],
      scene: scene(s6),
      panels: panels(s6),
    },
    {
      title: 'Why it is fast',
      tag: 'Cost',
      body: ['Every look halves the window. Halving a billion items takes only about 30 looks to reach a single block.', 'That is **O(log n)**: doubling the data adds just one more look.'],
      note: { kind: 'cost', text: 'O(log n) time, O(1) extra memory.' },
      scene: scene(s6),
      panels: panels(s6),
    },
  ],
};
