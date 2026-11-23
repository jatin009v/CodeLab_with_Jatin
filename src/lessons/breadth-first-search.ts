import type { BoxTone, SceneObj } from '../iso/types';
import { badge, link, node } from './graph';
import type { Lesson, Panel } from './types';

const POS: Record<string, [number, number]> = {
  A: [-9, 2],
  B: [-1, -2.5],
  C: [-1, 7],
  D: [8, -7],
  E: [8, 0.5],
  F: [8, 9],
};
const EDGES: [string, string][] = [
  ['A', 'B'],
  ['A', 'C'],
  ['B', 'D'],
  ['B', 'E'],
  ['C', 'F'],
  ['E', 'F'],
];
/** Edges BFS travels along to discover a node for the first time. */
const TREE = new Set(['A-B', 'A-C', 'B-D', 'B-E', 'C-F']);

interface State {
  dist: Record<string, number>;
  done: string[];
  current?: string;
  /** Edge to highlight as "already seen, skip". */
  skip?: string;
  tree?: boolean;
}

function scene(s: State): SceneObj[] {
  const nodes = Object.fromEntries(
    Object.entries(POS).map(([k, [u, v]]) => {
      const tone: BoxTone = k === s.current ? 'hot' : s.done.includes(k) ? 'soft' : k in s.dist ? 'soft' : 'plain';
      return [k, node(k, u, v, k, tone, { ring: k === s.current, dot: k === s.current })];
    }),
  );
  const objs: SceneObj[] = [];
  for (const [a, b] of EDGES) {
    const id = `${a}-${b}`;
    const travelled = (s.tree || s.done.includes(a)) && TREE.has(id) && b in s.dist;
    const tone = id === s.skip ? 'coral' : s.tree ? (TREE.has(id) ? 'coral' : 'faint') : travelled ? 'coral' : 'ink';
    objs.push(link(id, nodes[a], nodes[b], { tone, dashed: id === s.skip }));
  }
  objs.push(...Object.values(nodes));
  for (const [k, d] of Object.entries(s.dist)) objs.push(badge(`d${k}`, nodes[k], String(d), k === s.current ? 'coral' : 'dark'));
  return objs;
}

function queuePanel(queue: string[], finished: string[]): Panel {
  return {
    type: 'rows',
    title: 'Waiting their turn',
    rows: [
      { label: 'Queue', sub: 'front first', values: queue.length ? queue.map((q, i) => ({ v: q, state: i === 0 ? 'hot' : 'plain' })) : ['empty'], hot: true },
      { label: 'Finished', values: finished.length ? finished : ['—'] },
    ],
  };
}

export const breadthFirstSearch: Lesson = {
  id: 'breadth-first-search',
  title: 'Breadth-First Search',
  code: [
    'bfs(start):',
    '    mark start as seen, put it in a queue',
    '    while the queue is not empty:',
    '        node ← take the front of the queue',
    '        for each neighbour of node:',
    '            if it has not been seen:',
    '                mark it as seen',
    '                put it at the back of the queue',
  ],
  steps: [
    {
      title: 'Nearest first',
      tag: 'Concept',
      body: ['Breadth-first search explores a graph in rings. First the start, then everything one edge away, then everything two edges away, and so on.', 'We start at **A**.'],
      note: { kind: 'picture', text: 'A ripple spreading out from a stone dropped in a pond.' },
      lines: [1, 2],
      scene: scene({ dist: { A: 0 }, done: [], current: 'A' }),
      panels: [queuePanel(['A'], [])],
    },
    {
      title: 'The first ring',
      tag: 'Step',
      body: ['Take A from the queue. Look at each of its neighbours: B and C have not been seen, so mark them and put them in a **queue**.', 'The number on a node is how many edges it is from A.'],
      lines: [4, 5, 6, 7, 8],
      scene: scene({ dist: { A: 0, B: 1, C: 1 }, done: ['A'], current: 'A' }),
      panels: [queuePanel(['B', 'C'], ['A'])],
    },
    {
      title: 'The queue keeps the order',
      tag: 'Step',
      body: ['Take the front of the queue: B. Its new neighbours D and E join the **back** of the queue, behind C.', 'Because a queue is first-in, first-out, every distance-1 node is handled before any distance-2 node.'],
      lines: [3, 4, 5, 6, 7, 8],
      scene: scene({ dist: { A: 0, B: 1, C: 1, D: 2, E: 2 }, done: ['A', 'B'], current: 'B' }),
      panels: [queuePanel(['C', 'D', 'E'], ['A', 'B'])],
    },
    {
      title: 'Seen means skip',
      tag: 'Step',
      body: ['C finds F and queues it. Later, E looks at F too, but F is already marked as seen, so it is **skipped**.', 'Without that mark, nodes reachable in two ways would be visited twice, and a graph with a cycle would loop forever.'],
      lines: [6],
      scene: scene({ dist: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2 }, done: ['A', 'B', 'C', 'D'], current: 'E', skip: 'E-F' }),
      panels: [queuePanel(['F'], ['A', 'B', 'C', 'D', 'E'])],
    },
    {
      title: 'Fewest edges',
      tag: 'Result',
      body: [
        'The queue is empty: every node reachable from A has been found. The highlighted edges are the ones BFS discovered nodes through.',
        'Following them back from any node gives a path to A with the **fewest edges** possible. That is why BFS finds shortest paths in unweighted graphs.',
      ],
      note: { kind: 'cost', text: 'O(V + E): each node is queued once and each edge is looked at once from each end.' },
      scene: scene({ dist: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2 }, done: ['A', 'B', 'C', 'D', 'E', 'F'], tree: true }),
      panels: [queuePanel([], ['A', 'B', 'C', 'D', 'E', 'F'])],
    },
  ],
};
