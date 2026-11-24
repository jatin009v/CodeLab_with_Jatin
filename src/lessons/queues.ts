import { box, slab, tag } from '../iso/build';
import type { SceneObj } from '../iso/types';
import type { Lesson, Step } from './types';

function queueScene(activeCount: number, highlightEnd?: 'front' | 'rear'): SceneObj[] {
  const objs: SceneObj[] = [
    slab('base', 0, 0, 8.2, 3.8, 0.6, { side: 'QUEUE (FIFO - FIRST IN FIRST OUT)', tray: true }),
    tag('front_arrow', [1.5, 3.2, 0.6], '← DEQUEUE (Front)', { dx: -60, dy: -30, tone: highlightEnd === 'front' ? 'coral' : 'dark' }),
    tag('rear_arrow', [6.8, 3.2, 0.6], 'ENQUEUE ← (Rear)', { dx: -60, dy: -30, tone: highlightEnd === 'rear' ? 'coral' : 'dark' }),
  ];

  const items = [
    { id: 'q_0', val: 'Task A', status: activeCount >= 1 ? 'ready' : 'empty' },
    { id: 'q_1', val: 'Task B', status: activeCount >= 2 ? 'ready' : 'empty' },
    { id: 'q_2', val: 'Task C', status: activeCount >= 3 ? 'ready' : 'empty' },
    { id: 'q_3', val: 'Task D', status: activeCount >= 4 ? 'ready' : 'empty' },
  ];

  items.forEach((item, i) => {
    const x = 1.6 + i * 1.4;
    const isPresent = item.status === 'ready';
    const isFront = isPresent && i === 0;
    const isRear = isPresent && i === activeCount - 1;

    const tone = (highlightEnd === 'front' && isFront) || (highlightEnd === 'rear' && isRear)
      ? 'hot'
      : isPresent
      ? 'plain'
      : 'faint';

    objs.push(
      box(item.id, x, 1.2, 0.6, isPresent ? item.val : 'Empty', tone as any, {
        w: 1.2,
        d: 1.4,
        h: 0.9,
        labelSize: 13,
        dot: isFront || isRear,
      }),
    );

    if (isPresent) {
      if (isFront) {
        objs.push(tag('tag_f', [x + 0.6, 1.2, 1.5], 'Front', { dx: -18, dy: -24, tone: 'coral' }));
      }
      if (isRear) {
        objs.push(tag('tag_r', [x + 0.6, 1.2, 1.5], 'Rear', { dx: -18, dy: -24, tone: 'dark' }));
      }
    }
  });

  return objs;
}

const queueCode = [
  'class Queue:',
  '    def __init__(self):',
  '        self.items = deque()',
  '',
  '    def enqueue(self, item):',
  '        self.items.append(item)',
  '',
  '    def dequeue(self):',
  '        if not self.items:',
  '            raise IndexError("Queue is empty")',
  '        return self.items.popleft()',
  '',
  '    def peek(self):',
  '        return self.items[0]',
];

const steps: Step[] = [
  {
    title: 'What is a Queue?',
    tag: 'Concept',
    body: [
      'A Queue is an ordered linear collection adhering strictly to the **FIFO (First-In, First-Out)** principle.',
      'The first item inserted is always the first item removed, just like waiting in line at a ticket counter or handling incoming requests in a web server socket.',
    ],
    lines: [1, 2, 3],
    scene: queueScene(3),
    panels: [
      {
        type: 'rows',
        title: 'Queue Invariant',
        rows: [
          { label: 'Ordering Principle', values: ['FIFO (First In First Out)'] },
          { label: 'Front Access', values: ['O(1) peek / dequeue'] },
          { label: 'Rear Access', values: ['O(1) enqueue'] },
          { label: 'Search / Middle', values: ['O(n) linear scan'] },
        ],
      },
    ],
  },
  {
    title: 'Enqueue Operation (Push to Rear)',
    tag: 'Enqueue',
    body: [
      'Enqueue appends a new element to the back (**Rear**) of the queue.',
      'In a linked list or circular buffer, updating the tail pointer takes constant time O(1). Here, **Task D** arrives and joins the back behind Task C.',
    ],
    lines: [5, 6],
    scene: queueScene(4, 'rear'),
    panels: [
      {
        type: 'rows',
        title: 'Enqueue Event',
        rows: [
          { label: 'Operation', values: ['enqueue("Task D")'] },
          { label: 'Time Complexity', values: ['O(1)'] },
          { label: 'Queue Length', values: ['4 items'] },
          { label: 'Current Rear', values: ['Task D'] },
        ],
      },
    ],
  },
  {
    title: 'Dequeue Operation (Pop from Front)',
    tag: 'Dequeue',
    body: [
      'Dequeue extracts and returns the item from the front of the queue. **Task A**, having arrived first, departs for processing.',
      'The front pointer advances to Task B. In a proper queue implementation (like Python deque or a Doubly Linked List), this is O(1) without shifting subsequent elements.',
    ],
    lines: [8, 9, 10, 11],
    scene: queueScene(3, 'front'),
    panels: [
      {
        type: 'rows',
        title: 'Dequeue Event',
        rows: [
          { label: 'Operation', values: ['dequeue() → "Task A"'] },
          { label: 'Next in Line', values: ['Task B'] },
          { label: 'Time Complexity', values: ['O(1) amortized'] },
          { label: 'Buffer Shift Needed?', values: ['None (circular pointer)'] },
        ],
      },
    ],
  },
  {
    title: 'Real-World Applications & Cheatsheet',
    tag: 'In Practice',
    body: [
      'Queues drive asynchronous systems worldwide: task runners (Celery, BullMQ), printer spoolers, breadth-first search (BFS) level exploration, and OS process schedulers.',
      'Whenever items must be serviced in their exact arrival sequence with fair queuing, use a Queue.',
    ],
    lines: [13, 14],
    scene: queueScene(2),
    panels: [
      {
        type: 'rows',
        title: 'Queue Complexity',
        rows: [
          { label: 'Enqueue', values: ['O(1)'] },
          { label: 'Dequeue', values: ['O(1)'] },
          { label: 'Peek (Head)', values: ['O(1)'] },
          { label: 'Space Complexity', values: ['O(n)'] },
        ],
      },
    ],
  },
];

export const queues: Lesson = {
  id: 'queues',
  title: 'Queues (FIFO)',
  code: queueCode,
  steps,
};
