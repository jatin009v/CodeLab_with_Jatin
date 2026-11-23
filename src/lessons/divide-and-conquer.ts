import { box, edge, tag, topOf } from '../iso/build';
import { flat } from '../iso/project';
import type { BoxObj, BoxTone, SceneObj } from '../iso/types';
import type { Lesson, Panel } from './types';

const N = 8;
const LEVELS = 4; // 8, 4, 2, 1
const SPREAD = 20;
const ROW = 2.4;

interface NodeInfo {
  id: string;
  level: number;
  index: number;
  size: number;
}

const nodes: NodeInfo[] = [];
for (let L = 0; L < LEVELS; L++) for (let i = 0; i < 2 ** L; i++) nodes.push({ id: `n${L}-${i}`, level: L, index: i, size: N / 2 ** L });

function place(n: NodeInfo, tone: BoxTone, extra: Partial<BoxObj> = {}): BoxObj {
  const u = ((n.index + 0.5) / 2 ** n.level - 0.5) * SPREAD;
  const v = n.level * ROW;
  const { x, y } = flat(u, v);
  const s = n.level === 0 ? 1.15 : 1;
  return box(n.id, x - s / 2, y - s / 2, 0, String(n.size), tone, { w: s, d: s, h: s, ...extra });
}

interface Opts {
  depth: number; // how many levels are visible
  tone?: (n: NodeInfo) => BoxTone;
  dot?: (n: NodeInfo) => boolean;
  extra?: (placed: Map<string, BoxObj>) => SceneObj[];
}

function scene({ depth, tone = () => 'plain', dot = () => false, extra }: Opts): SceneObj[] {
  const placed = new Map<string, BoxObj>();
  const objs: SceneObj[] = [];
  for (const n of nodes) {
    if (n.level >= depth) continue;
    const b = place(n, tone(n), { dot: dot(n) });
    placed.set(n.id, b);
    objs.push(b);
  }
  for (const n of nodes) {
    if (n.level === 0 || n.level >= depth) continue;
    const parent = placed.get(`n${n.level - 1}-${n.index >> 1}`)!;
    const child = placed.get(n.id)!;
    const dim = tone(n) === 'dim';
    objs.push(edge(`e-${n.id}`, topOf(parent), topOf(child), { tone: dim ? 'faint' : 'ink' }));
  }
  if (extra) objs.push(...extra(placed));
  return objs;
}

/** Post-order finishing order of the inner nodes: both halves before the whole. */
const finishOrder = new Map<string, number>();
(function walk(L: number, i: number) {
  if (L === LEVELS - 1) return;
  walk(L + 1, 2 * i);
  walk(L + 1, 2 * i + 1);
  finishOrder.set(`n${L}-${i}`, finishOrder.size + 1);
})(0, 0);

const onPath = (n: NodeInfo) => n.index === 0;

function shape(pieces: number, size: number, levels: number, foot?: string): Panel {
  return {
    type: 'rows',
    title: 'The shape of the work',
    rows: [
      { label: 'Pieces at the bottom', values: [String(pieces)] },
      { label: 'Size of each', values: [String(size)] },
      { label: 'Levels', values: [String(levels)], hot: true },
    ],
    foot,
  };
}

export const divideAndConquer: Lesson = {
  id: 'divide-and-conquer',
  title: 'Divide & Conquer',
  code: [
    'solve(problem):',
    '    if problem is small enough:',
    '        return its answer directly    // base case',
    '    split problem into smaller pieces  // divide',
    '    solve each piece the same way      // conquer',
    '    return their answers, put together // combine',
  ],
  steps: [
    {
      title: 'Too big to do at once',
      tag: 'Problem',
      body: ['Here is a problem of size 8: sort eight numbers, add up eight values, search eight items.', 'Tackling it head-on can be awkward. **Divide and conquer** breaks it into smaller copies of itself until the copies are easy.'],
      scene: scene({ depth: 1, tone: () => 'soft' }),
      panels: [shape(1, 8, 1)],
    },
    {
      title: 'Divide',
      tag: 'Step',
      body: ['Cut the problem into smaller problems of the same kind. Usually that means in half: two problems of size 4.', 'Nothing is solved yet. But each half can be handled by the very same method, and that is where recursion comes in.'],
      lines: [4],
      scene: scene({ depth: 2, tone: (n) => (n.level === 1 ? 'soft' : 'plain') }),
      panels: [shape(2, 4, 2)],
    },
    {
      title: 'Until it is trivial',
      tag: 'Step',
      body: ['Keep halving. 4 becomes 2 and 2, each 2 becomes 1 and 1.', 'A piece of size 1 needs no work at all: one number is already sorted, one value is already its own sum. That is the **base case**, where the splitting stops.'],
      lines: [2, 3],
      scene: scene({ depth: 4, tone: (n) => (n.level === 3 ? 'soft' : 'plain') }),
      panels: [shape(8, 1, 4)],
    },
    {
      title: 'Combine on the way back',
      tag: 'Step',
      body: ['Now the answers travel upward. Two solved halves are joined into the answer for the piece above them, and so on up to the top.', 'The numbers show the order in which pieces get finished. Both halves are always done before the whole they belong to.'],
      lines: [5, 6],
      scene: scene({
        depth: 4,
        tone: (n) => (n.level === 3 ? 'soft' : 'plain'),
        dot: (n) => n.id === 'n1-0',
        extra: (placed) =>
          [...finishOrder].map(([id, k]) => tag(`ord-${id}`, topOf(placed.get(id)!), String(k), { tone: 'coral', dy: -34, size: 14, leader: false })),
      }),
      panels: [shape(8, 1, 4, 'In merge sort, this joining step is the merge.')],
    },
    {
      title: 'Add it up level by level',
      tag: 'Cost',
      body: [
        'Count the work one level at a time. Each level touches all 8 items in total: one piece of 8, two of 4, four of 2, eight of 1.',
        'There are log₂ 8 + 1 = 4 levels, so splitting and joining costs about **n log n**. That is the price of merge sort.',
      ],
      note: { kind: 'cost', text: 'n items × log n levels. For a million items: about 20 million steps, not a trillion.' },
      scene: scene({
        depth: 4,
        tone: (n) => (n.level === 3 ? 'soft' : 'plain'),
        extra: () =>
          Array.from({ length: LEVELS }, (_, L) => {
            const { x, y } = flat(SPREAD / 2 + 2.6, L * ROW);
            return tag(`lvl${L}`, [x, y, 0.5], `${2 ** L} × ${N / 2 ** L} = ${N}`, { tone: 'light', leader: false, mono: true, size: 14 });
          }),
      }),
      panels: [
        {
          type: 'rows',
          title: 'The shape of the work',
          rows: [
            { label: 'Work per level', values: ['8'] },
            { label: 'Levels', values: ['4'] },
            { label: 'Total', sub: '≈ n log n', values: ['32'], hot: true },
          ],
        },
      ],
    },
    {
      title: 'Or follow only one branch',
      tag: 'Variant',
      body: [
        'Sometimes you only need one of the halves. Binary search looks at the middle, decides which side the answer is on, and never visits the other side.',
        'Then the work is just the height of the tree: **log n** steps. Three halvings take 8 down to 1.',
      ],
      lines: [4, 5],
      scene: scene({ depth: 4, tone: (n) => (onPath(n) ? (n.level === 3 ? 'hot' : 'soft') : 'dim') }),
      panels: [shape(1, 1, 4, 'Only one piece per level is ever looked at.')],
    },
    {
      title: 'Where it shows up',
      tag: 'In practice',
      body: ['Merge sort and quick sort split an array and sort the halves. Binary search throws half away each time. Fast exponentiation squares its way to big powers.', 'The pattern is always the same three moves: **divide**, **conquer**, **combine**.'],
      note: { kind: 'picture', text: 'Sorting a pile of exam papers with friends: split the pile, each sorts a part, then merge the sorted parts.' },
      lines: [1, 2, 3, 4, 5, 6],
      scene: scene({ depth: 4, tone: (n) => (n.level === 0 ? 'hot' : n.level === 3 ? 'soft' : 'plain') }),
      panels: [shape(8, 1, 4)],
    },
  ],
};
