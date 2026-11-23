import { box, slab, tag } from '../iso/build';
import type { SceneObj } from '../iso/types';
import { link, node } from './graph';
import type { Lesson, Panel } from './types';

const POS: Record<string, [number, number]> = { A: [-9, 0], B: [-1, -5], C: [9, 0], D: [-1, 5] };
const ROADS: [string, string, number][] = [
  ['A', 'B', 4],
  ['A', 'D', 3],
  ['B', 'D', 2],
  ['B', 'C', 7],
  ['A', 'C', 9],
  ['D', 'C', 6],
];
const cost = (route: string[]) =>
  route.slice(1).reduce((sum, t, i) => sum + ROADS.find(([a, b]) => (a === route[i] && b === t) || (b === route[i] && a === t))![2], 0);

function scene(route: string[] | null, opts: { dim?: boolean; pos?: string } = {}): SceneObj[] {
  const used = new Set<string>();
  if (route) for (let i = 1; i < route.length; i++) used.add([route[i - 1], route[i]].sort().join(''));
  const nodes = Object.fromEntries(
    Object.entries(POS).map(([k, [u, v]]) => [k, node(k, u, v, k, opts.dim ? 'dim' : k === 'A' ? 'hot' : route?.includes(k) ? 'soft' : 'plain', { ring: route?.includes(k) && !opts.dim, dot: k === 'A' && !opts.dim })]),
  );
  const objs: SceneObj[] = ROADS.map(([a, b, w]) => {
    const on = used.has([a, b].sort().join(''));
    return link(`${a}${b}`, nodes[a], nodes[b], { tone: opts.dim ? 'faint' : route ? (on ? 'coral' : 'faint') : 'ink', chip: String(w), chipTone: on && !opts.dim ? 'coral' : 'light' });
  });
  objs.push(...Object.values(nodes));
  return objs;
}

const ROUTE = ['A', 'D', 'B', 'C', 'A'];
const BEST = ['A', 'B', 'C', 'D', 'A'];

function round(route: string[], extra: { label: string; values: string[]; hot?: boolean }[] = []): Panel {
  return {
    type: 'rows',
    title: 'The round',
    rows: [{ label: 'Route', values: route }, { label: 'Cost', values: [String(cost(route))], hot: true }, ...extra],
  };
}

function classes(): SceneObj[] {
  return [
    slab('np', 0, 0, 10, 7, 0.7, { side: 'NP · QUICK TO CHECK', tray: true }),
    slab('p', 1.4, 1.6, 5.2, 3.6, 0.6, { z: 0.7, side: 'P · QUICK TO SOLVE' }),
    box('sort', 2.4, 2.4, 1.3, 'sort', 'soft', { w: 1.2, d: 1.2, h: 0.9, labelSize: 15 }),
    box('path', 4.2, 2.4, 1.3, 'path', 'soft', { w: 1.2, d: 1.2, h: 0.9, labelSize: 15 }),
    box('tsp', 7.4, 1.0, 0.7, 'TSP', 'hot', { w: 1.3, d: 1.3, h: 1.1, labelSize: 16 }),
    box('sudoku', 7.4, 4.4, 0.7, 'sudoku', 'plain', { w: 1.3, d: 1.3, h: 1.1, labelSize: 13 }),
    tag('q', [8.05, 1.65, 1.8], 'in P too? nobody knows', { tone: 'coral', dy: -60, dx: 40 }),
  ];
}

export const pVsNp: Lesson = {
  id: 'p-vs-np',
  title: 'P vs NP',
  code: [
    'check(route, budget):',
    '    total ← add up the roads along the route',
    '    return total ≤ budget        // one pass: quick',
    '',
    'find_best(towns):',
    '    best ← nothing',
    '    for each order the towns could be visited in:',
    '        if that round trip is cheaper than best:',
    '            best ← it',
    '    return best                  // (n − 1)!/2 orders: slow',
  ],
  steps: [
    {
      title: 'A delivery round',
      tag: 'Problem',
      body: ['A van leaves town **A**, must visit B, C and D once each, and come home. Each road has a cost.', 'What is the cheapest round trip? This is the **travelling salesperson problem**.'],
      scene: scene(null),
      panels: [{ type: 'rows', title: 'The round', rows: [{ label: 'Towns', values: ['A', 'B', 'C', 'D'] }, { label: 'Roads', values: ['6'], hot: true }] }],
    },
    {
      title: 'Checking an answer is quick',
      tag: 'Check',
      body: ['Someone hands you a route: A, D, B, C and home. Is it a round trip costing 21 or less? Follow it and add up: 3 + 2 + 7 + 9 = 21. Yes.', 'One pass along the route settles it. Checking a proposed answer is fast, however many towns there are.'],
      lines: [1, 2, 3],
      scene: scene(ROUTE),
      panels: [round(ROUTE, [{ label: 'Round trips possible', values: ['3'] }])],
    },
    {
      title: 'Finding the best is not',
      tag: 'Search',
      body: ['To be sure a route is the cheapest, the obvious method tries them all. With 4 towns there are only 3 different round trips: 21, 21 and **20**.', 'A, B, C, D and home wins. Easy here, but that list grows terribly fast.'],
      lines: [5, 6, 7, 8, 9, 10],
      scene: scene(BEST),
      panels: [
        round(BEST, [
          { label: 'A D B C A', values: ['21'] },
          { label: 'A B D C A', values: ['21'] },
        ]),
      ],
    },
    {
      title: 'The count explodes',
      tag: 'Cost',
      body: ['With n towns there are (n − 1)! / 2 round trips. 10 towns: 181,440. 20 towns: about 60 million billion.', 'Faster computers barely help: each extra town multiplies the work. Nobody knows a method that is fundamentally better for every case.'],
      note: { kind: 'cost', text: 'Brute force is O(n!). Even the best known exact methods take exponential time.' },
      lines: [7, 10],
      scene: scene(null, { dim: true }),
      panels: [
        {
          type: 'bars',
          title: 'Round trips to try',
          sub: 'Bar length on a log scale.',
          bars: [
            { label: '4', suffix: 'towns', value: '3', frac: 0.03 },
            { label: '10', suffix: 'towns', value: '2×10⁵', frac: 0.3 },
            { label: '20', suffix: 'towns', value: '6×10¹⁶', frac: 0.65 },
            { label: '30', suffix: 'towns', value: '4×10³⁰', frac: 1 },
          ],
        },
      ],
    },
    {
      title: 'P and NP',
      tag: 'Concept',
      body: [
        '**P** is the set of problems that can be solved quickly (in polynomial time): sorting, shortest paths. **NP** is the set whose answers can be checked quickly.',
        'Everything in P is in NP. The open question, worth a million-dollar prize, is whether NP is any bigger: is every quickly-checkable problem also quickly solvable?',
      ],
      note: { kind: 'aside', text: 'Most researchers believe P ≠ NP, but no one has proved it either way.' },
      scene: classes(),
      panels: [
        {
          type: 'rows',
          title: 'Two kinds of easy',
          rows: [
            { label: 'P', sub: 'solve fast', values: ['sort', 'path'] },
            { label: 'NP', sub: 'check fast', values: ['TSP', 'sudoku'], hot: true },
          ],
        },
      ],
    },
    {
      title: 'Knowing when to stop looking',
      tag: 'In practice',
      body: [
        'Recognising a hard problem saves you from hunting for a perfect fast algorithm that probably does not exist.',
        'Instead, settle for good: always drive to the nearest unvisited town gives A, D, B, C, A for 21 here, one more than the best. Heuristics like this are what real route planners use.',
      ],
      scene: scene(ROUTE),
      panels: [round(ROUTE, [{ label: 'Best possible', values: ['20'] }])],
    },
  ],
};
