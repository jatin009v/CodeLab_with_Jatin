import { box, edge, slab } from '../iso/build';
import type { SceneObj, Vec3 } from '../iso/types';
import type { Lesson, Step } from './types';

function dfsScene(currNode?: string, visited: string[] = []): SceneObj[] {
  const objs: SceneObj[] = [
    slab('base', 0, 0, 7.8, 4.2, 0.5, { side: 'DEPTH FIRST SEARCH (DFS & BACKTRACKING)', tray: true }),
  ];

  const nodeMap: Record<string, { pos: Vec3; label: string }> = {
    nA: { pos: [1.5, 2.2, 0.6], label: 'A' },
    nB: { pos: [3.2, 3.2, 0.6], label: 'B' },
    nC: { pos: [3.2, 1.2, 0.6], label: 'C' },
    nD: { pos: [5.2, 3.2, 0.6], label: 'D' },
    nE: { pos: [5.2, 1.2, 0.6], label: 'E' },
  };

  Object.entries(nodeMap).forEach(([id, item]) => {
    const isCurr = currNode === id;
    const isVisited = visited.includes(id);
    const tone = isCurr ? 'hot' : isVisited ? 'soft' : 'plain';

    objs.push(
      box(id, item.pos[0] - 0.5, item.pos[1] - 0.5, item.pos[2], item.label, tone as any, {
        w: 1.0,
        d: 1.0,
        h: 0.8,
        labelSize: 15,
        dot: isCurr,
      }),
    );
  });

  const graphEdges = [
    { id: 'e_AB', a: 'nA', b: 'nB' },
    { id: 'e_AC', a: 'nA', b: 'nC' },
    { id: 'e_BD', a: 'nB', b: 'nD' },
    { id: 'e_CD', a: 'nC', b: 'nD' },
    { id: 'e_DE', a: 'nD', b: 'nE' },
  ];

  graphEdges.forEach((e) => {
    const isTraversed = visited.includes(e.a) && visited.includes(e.b);
    const posA: Vec3 = [nodeMap[e.a].pos[0], nodeMap[e.a].pos[1], nodeMap[e.a].pos[2]];
    const posB: Vec3 = [nodeMap[e.b].pos[0], nodeMap[e.b].pos[1], nodeMap[e.b].pos[2]];
    objs.push(edge(e.id, posA, posB, { tone: isTraversed ? 'coral' : 'faint' }));
  });

  return objs;
}

const dfsCode = [
  'def dfs(graph, node, visited=None):',
  '    if visited is None:',
  '        visited = set()',
  '    visited.add(node)',
  '    print(f"Visited: {node}")',
  '    for neighbor in graph[node]:',
  '        if neighbor not in visited:',
  '            dfs(graph, neighbor, visited)',
  '    return visited',
];

const steps: Step[] = [
  {
    title: 'What is Depth-First Search?',
    tag: 'Concept',
    body: [
      'Depth-First Search (DFS) is a traversal algorithm that dives as deeply as possible along each branch before backtracking.',
      'Driven by a **LIFO stack** (or recursive call stack), DFS is the foundation of cycle detection, topological sorting, and finding connected components.',
    ],
    lines: [1, 2, 3, 4],
    scene: dfsScene('nA'),
    panels: [
      {
        type: 'rows',
        title: 'DFS Invariant',
        rows: [
          { label: 'Exploration Pattern', values: ['Deep branch descent then backtrack'] },
          { label: 'Underlying Structure', values: ['LIFO Call Stack'] },
          { label: 'Time Complexity', values: ['O(V + E)'] },
          { label: 'Space Complexity', values: ['O(V) recursion stack'] },
        ],
      },
    ],
  },
  {
    title: 'Diving Deep: Path A → B → D',
    tag: 'Descent',
    body: [
      'Starting at **A**, DFS looks at neighbors. It chooses **B**, marks it visited, and immediately descends deeper to **D**.',
      'Unlike BFS which visits all layer-1 neighbors first, DFS plunges along a single path to maximum depth.',
    ],
    lines: [6, 7, 8],
    scene: dfsScene('nD', ['nA', 'nB']),
    panels: [
      {
        type: 'rows',
        title: 'Active Exploration',
        rows: [
          { label: 'Call Stack', values: ['nA → nB → nD'] },
          { label: 'Visited Set', values: ['{A, B, D}'] },
          { label: 'Action', values: ['Exploring neighbors of D'] },
        ],
      },
    ],
  },
  {
    title: 'Reaching Node E & Dead End',
    tag: 'Dead End',
    body: [
      'From **D**, DFS moves to **E**. Node E has no unvisited neighbors (dead end).',
      'The function returns and **backtracks** up the call stack to D, then B, looking for any unexplored branches.',
    ],
    lines: [9],
    scene: dfsScene('nE', ['nA', 'nB', 'nD', 'nE']),
    panels: [
      {
        type: 'rows',
        title: 'Dead End & Backtrack',
        rows: [
          { label: 'Current Leaf', values: ['Node E'] },
          { label: 'Unvisited Neighbors', values: ['None (Dead end)'] },
          { label: 'Next Action', values: ['Backtrack to D → B → A'] },
        ],
      },
    ],
  },
  {
    title: 'Visiting Remaining Branches (Node C)',
    tag: 'Complete',
    body: [
      'After backtracking to **A**, DFS discovers neighbor **C** has not yet been visited. It descends to C.',
      'Once all nodes in graph {A, B, C, D, E} are visited, DFS terminates completely.',
    ],
    lines: [8, 9],
    scene: dfsScene('nC', ['nA', 'nB', 'nD', 'nE', 'nC']),
    panels: [
      {
        type: 'rows',
        title: 'DFS Traversal Complete',
        rows: [
          { label: 'Total Visited', values: ['5 / 5 Vertices'] },
          { label: 'Traversal Order', values: ['A → B → D → E → C'] },
          { label: 'Time Spent', values: ['O(V + E) edges inspected once'] },
        ],
      },
    ],
  },
];

export const depthFirstSearch: Lesson = {
  id: 'depth-first-search',
  title: 'Depth-First Search (DFS)',
  code: dfsCode,
  steps,
};
