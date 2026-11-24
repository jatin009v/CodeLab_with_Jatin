import { box, edge, slab } from '../iso/build';
import type { SceneObj, Vec3 } from '../iso/types';
import type { Lesson, Step } from './types';

function treeScene(activeNode?: string, visitedNodes: string[] = []): SceneObj[] {
  const objs: SceneObj[] = [
    slab('base', 0, 0, 7.5, 4.2, 0.5, { side: 'BINARY SEARCH TREE (BST)', tray: true }),
  ];

  const nodeMap: Record<string, { pos: Vec3; val: string }> = {
    n8: { pos: [3.75, 3.0, 2.2], val: '8' },
    n3: { pos: [2.0, 2.1, 1.4], val: '3' },
    n10: { pos: [5.5, 2.1, 1.4], val: '10' },
    n1: { pos: [1.0, 1.1, 0.6], val: '1' },
    n6: { pos: [2.8, 1.1, 0.6], val: '6' },
    n14: { pos: [6.3, 1.1, 0.6], val: '14' },
  };

  Object.entries(nodeMap).forEach(([id, item]) => {
    const isCurrent = activeNode === id;
    const isVisited = visitedNodes.includes(id);
    const tone = isCurrent ? 'hot' : isVisited ? 'soft' : 'plain';

    objs.push(
      box(id, item.pos[0] - 0.45, item.pos[1] - 0.45, item.pos[2], item.val, tone as any, {
        w: 0.9,
        d: 0.9,
        h: 0.8,
        labelSize: 15,
        dot: isCurrent,
      }),
    );
  });

  const treeEdges: { id: string; a: string; b: string }[] = [
    { id: 'e_8_3', a: 'n8', b: 'n3' },
    { id: 'e_8_10', a: 'n8', b: 'n10' },
    { id: 'e_3_1', a: 'n3', b: 'n1' },
    { id: 'e_3_6', a: 'n3', b: 'n6' },
    { id: 'e_10_14', a: 'n10', b: 'n14' },
  ];

  treeEdges.forEach((e) => {
    const posA: Vec3 = [nodeMap[e.a].pos[0], nodeMap[e.a].pos[1], nodeMap[e.a].pos[2]];
    const posB: Vec3 = [nodeMap[e.b].pos[0], nodeMap[e.b].pos[1], nodeMap[e.b].pos[2]];
    const isHot = activeNode === e.a || activeNode === e.b;
    objs.push(edge(e.id, posA, posB, { tone: isHot ? 'coral' : 'faint' }));
  });

  return objs;
}

const bstCode = [
  'class TreeNode:',
  '    def __init__(self, val=0, left=None, right=None):',
  '        self.val = val',
  '        self.left = left',
  '        self.right = right',
  '',
  'def search_bst(root, target):',
  '    if not root or root.val == target:',
  '        return root',
  '    if target < root.val:',
  '        return search_bst(root.left, target)',
  '    else:',
  '        return search_bst(root.right, target)',
  '',
  'def in_order(node):',
  '    if not node:',
  '        return',
  '    in_order(node.left)',
  '    visit(node.val)',
  '    in_order(node.right)',
];

const bstSteps: Step[] = [
  {
    title: 'Anatomy of a Binary Tree',
    tag: 'Structure',
    body: [
      'A **Binary Tree** is a hierarchical non-linear data structure where each node has at most two children: designated as **left** and **right**.',
      'The top node is the **Root**, and nodes with no children are **Leaves**.',
    ],
    lines: [1, 2, 3, 4, 5],
    scene: treeScene('n8'),
    panels: [
      {
        type: 'rows',
        title: 'Tree Properties',
        rows: [
          { label: 'Root Value', values: ['8'] },
          { label: 'Max Height', values: ['2 (3 levels)'] },
          { label: 'Max Degree', values: ['2 children / node'] },
          { label: 'Leaf Nodes', values: ['1, 6, 14'] },
        ],
      },
    ],
  },
  {
    title: 'The Binary Search Tree (BST) Invariant',
    tag: 'Invariant',
    body: [
      'A Binary Search Tree enforces a fundamental ordering rule:',
      '- Every node in the **left subtree** has a value strictly **less** than the node.',
      '- Every node in the **right subtree** has a value strictly **greater** than the node.',
      'Notice: 1 < 3 < 6 < 8 < 10 < 14. This invariant allows binary search speed on dynamic sets!',
    ],
    lines: [7, 8, 9, 10, 11, 12, 13],
    scene: treeScene('n3', ['n8']),
    panels: [
      {
        type: 'rows',
        title: 'BST Ordering Rule',
        rows: [
          { label: 'Left Subtree', values: ['Values < 8 (3, 1, 6)'] },
          { label: 'Right Subtree', values: ['Values > 8 (10, 14)'] },
          { label: 'Search Efficiency', values: ['O(log n) balanced'] },
        ],
      },
    ],
  },
  {
    title: 'Searching in a BST: Finding Target 6',
    tag: 'Search',
    body: [
      'Let us search for **6**:',
      '1. Compare with root (8): 6 < 8, so branch **left** to node 3.',
      '2. Compare with node 3: 6 > 3, so branch **right** to node 6.',
      '3. Found match 6 == 6 in only 2 comparisons!',
    ],
    lines: [10, 11],
    scene: treeScene('n6', ['n8', 'n3']),
    panels: [
      {
        type: 'rows',
        title: 'Search Trace: target = 6',
        rows: [
          { label: 'Current Node', values: ['Node 6 (Target Found)'] },
          { label: 'Steps Taken', values: ['2 hops (Root → Left → Right)'] },
          { label: 'Comparisons Saved', values: ['4 nodes skipped'] },
          { label: 'Status', values: ['Match Confirmed'] },
        ],
      },
    ],
  },
  {
    title: 'Tree Traversals: In-Order Yields Sorted Sequence',
    tag: 'Traversal',
    body: [
      'Traversing a BST **In-Order** (Left → Root → Right) naturally visits elements in ascending monotonic order: [1, 3, 6, 8, 10, 14].',
      'Pre-Order is ideal for tree cloning, while Post-Order is ideal for deleting subtrees.',
    ],
    lines: [15, 16, 17, 18, 19, 20],
    scene: treeScene(undefined, ['n1', 'n3', 'n6', 'n8', 'n10', 'n14']),
    panels: [
      {
        type: 'rows',
        title: 'Traversal Complexities',
        rows: [
          { label: 'In-Order', values: ['[1, 3, 6, 8, 10, 14] (Sorted)'] },
          { label: 'Time Complexity', values: ['O(n) visits all nodes'] },
          { label: 'Auxiliary Space', values: ['O(h) recursion stack depth'] },
        ],
      },
    ],
  },
];

export const binaryTrees: Lesson = {
  id: 'binary-trees',
  title: 'Binary Trees & BSTs',
  code: bstCode,
  steps: bstSteps,
};

export const treeTraversals: Lesson = {
  id: 'tree-traversals',
  title: 'Tree Traversals',
  code: bstCode,
  steps: bstSteps,
};
