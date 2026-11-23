import { box, edge, slab, tag } from '../iso/build';
import type { PanelObj, SceneObj } from '../iso/types';
import type { Lesson, Panel } from './types';

const BASE_H = 0.8;
const BH = 0.85; // block height
const COL = { x: 1.5, y: 1.5 };
const IN = { x: -2.5, y: 1.5 };
const OUT = { x: 4.9, y: 0.9 };
const PAD_H = 0.55;

type Item = { id: string; label: string };

interface State {
  stack: Item[];
  input?: Item;
  output?: Item[];
  op?: 'push' | 'pop' | 'top' | 'size' | 'empty';
  peek?: boolean;
  small?: boolean;
}

function scene({ stack, input, output = [], op, peek, small }: State): SceneObj[] {
  const objs: SceneObj[] = [
    slab('base', 0, 0, 4.4, 4.4, BASE_H, { side: 'STACK SYSTEM', tray: true }),
    slab('in', IN.x, IN.y, 2.2, 2.2, PAD_H, { side: 'INPUT' }),
    slab('out', OUT.x, OUT.y, 2.2, 2.2, PAD_H, { side: 'OUTPUT' }),
    { kind: 'wire', id: 'wire', x: COL.x - 0.1, y: COL.y - 0.1, z: BASE_H, w: 1.6, d: 1.6, h: 4.3 },
    edge('arrow-in', [-0.25, 2.6, 0.5], [0.55, 2.6, 0.95], { arrow: true, over: true }),
    edge('arrow-out', [4.5, 2.0, 0.6], [5.2, 2.0, 0.5], { arrow: true, over: true }),
    tag('lifo', [COL.x - 0.1, COL.y + 1.5, BASE_H + 4.3], 'Stack\n(LIFO)', { dx: -110, dy: -36 }),
  ];
  const lbl = small ? 17 : undefined;
  stack.forEach((it, k) => {
    const isTop = k === stack.length - 1;
    objs.push(box(it.id, COL.x, COL.y, BASE_H + k * (BH + 0.05), it.label, peek && isTop ? 'hot' : 'plain', { w: 1.4, d: 1.4, h: BH, labelSize: lbl }));
  });
  if (stack.length) {
    const zTop = BASE_H + (stack.length - 1) * (BH + 0.05) + BH * 0.55;
    objs.push(tag('top', [COL.x, COL.y + 1.4, zTop], peek ? `top = ${stack[stack.length - 1].label}` : 'top', { tone: 'coral', dx: -62, dy: -6 }));
  }
  if (input) objs.push(box(input.id, IN.x + 0.4, IN.y + 0.4, PAD_H, input.label, 'plain', { w: 1.4, d: 1.4, h: BH }));
  output.forEach((it, k) => objs.push(box(it.id, OUT.x + 0.4, OUT.y + 0.4, PAD_H + k * (BH + 0.05), it.label, 'plain', { w: 1.4, d: 1.4, h: BH })));

  const ops: PanelObj = {
    kind: 'panel',
    id: 'ops',
    at: [COL.x + 1.5, COL.y - 0.1, BASE_H + 1.6],
    dx: 105,
    dy: -185,
    title: 'OPERATIONS',
    leader: true,
    items: [
      { icon: '+', text: 'Push (x)', hot: op === 'push' },
      { icon: '−', text: 'Pop ()', hot: op === 'pop' },
      { icon: '◉', text: 'Top ()', hot: op === 'top' },
      { icon: '#', text: 'Size ()', hot: op === 'size' },
      { icon: '□', text: 'Empty ()', hot: op === 'empty' },
    ],
  };
  objs.push(ops);
  return objs;
}

const it = (n: string): Item => ({ id: 'b' + n, label: n });

function statePanel(stack: Item[], out: Item[] = []): Panel {
  return {
    type: 'rows',
    title: 'The stack',
    rows: [
      { label: 'Size', values: [String(stack.length)] },
      { label: 'Top', values: [stack.length ? stack[stack.length - 1].label : '—'], hot: true },
      { label: 'Bottom → top', values: stack.map((s) => s.label) },
      ...(out.length ? [{ label: 'Came out', sub: 'in order', values: out.map((s) => s.label) }] : []),
    ],
  };
}

const s123 = [it('10'), it('20'), it('30')];
const s1234 = [...s123, it('40')];

export const stacks: Lesson = {
  id: 'stacks',
  title: 'Stacks',
  code: [
    'push(x):',
    '    put x on top',
    '',
    'pop():',
    '    if the stack is empty: error',
    '    take the top item off',
    '    return it',
    '',
    'top():',
    '    return the top item, leaving it there',
    '',
    'empty():',
    '    return whether nothing is left',
  ],
  steps: [
    {
      title: 'What is a stack?',
      tag: 'Concept',
      body: ['A stack is a pile. New things go on the top, and the only thing you can take is whatever is on the top.', 'So whatever went in last comes out first: **LIFO**, last in, first out.'],
      note: { kind: 'picture', text: 'A pile of plates in a cupboard. Nobody slides one out from the middle.' },
      scene: scene({ stack: s123, input: it('40') }),
      panels: [statePanel(s123)],
    },
    {
      title: 'Push',
      tag: 'Operation',
      body: ['**Push** puts a new item on the top. 40 leaves the input pad and lands on 30.', 'Nothing underneath moves, so a push costs the same however tall the stack is.'],
      note: { kind: 'cost', text: 'O(1): one item placed, nothing else touched.' },
      lines: [1, 2],
      scene: scene({ stack: s1234, op: 'push' }),
      panels: [statePanel(s1234)],
    },
    {
      title: 'Top',
      tag: 'Operation',
      body: ['**Top** (sometimes called peek) tells you what is on the top without taking it off.', 'The stack is exactly as it was afterwards: 40 is still there.'],
      lines: [9, 10],
      scene: scene({ stack: s1234, op: 'top', peek: true }),
      panels: [statePanel(s1234)],
    },
    {
      title: 'Pop',
      tag: 'Operation',
      body: ['**Pop** takes the top item off and hands it back. 40 goes to the output, and 30 is the top again.', 'Popping an empty stack is an error, so code usually checks **empty()** first.'],
      note: { kind: 'cost', text: 'O(1) as well. Only the top is ever touched.' },
      lines: [4, 5, 6, 7],
      scene: scene({ stack: s123, output: [it('40')], op: 'pop' }),
      panels: [statePanel(s123, [it('40')])],
    },
    {
      title: 'Last in, first out',
      tag: 'Concept',
      body: ['Pop again and 30 comes out. The items went in as 10, 20, 30, 40 and they come out as 40, 30, 20, 10.', 'A stack reverses order. That is exactly what you want whenever you need to undo, backtrack, or match the most recent thing.'],
      lines: [4, 5, 6, 7],
      scene: scene({ stack: [it('10'), it('20')], output: [it('40'), it('30')], op: 'pop' }),
      panels: [statePanel([it('10'), it('20')], [it('40'), it('30')])],
    },
    {
      title: 'Where you meet them',
      tag: 'In practice',
      body: [
        'Each time a function calls another, the computer pushes a frame onto the **call stack**. When the function returns, its frame is popped and the caller picks up where it left off.',
        'Undo history and a browser’s Back button work the same way.',
      ],
      note: { kind: 'aside', text: '“Stack overflow” is this stack running out of room, usually because a recursion never stops.' },
      scene: scene({ stack: [it('10'), it('20'), it('30')].map((s, i) => ({ ...s, label: ['main()', 'load()', 'parse()'][i] })), small: true }),
      panels: [
        {
          type: 'rows',
          title: 'Call stack',
          rows: [
            { label: 'Running now', values: ['parse()'], hot: true },
            { label: 'Waiting', values: ['load()', 'main()'] },
          ],
          foot: 'When parse() returns, load() carries on.',
        },
      ],
    },
  ],
};
