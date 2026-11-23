import { box, edge, slab, tag } from '../iso/build';
import type { BoxTone, SceneObj, Vec3 } from '../iso/types';
import type { Lesson, Panel } from './types';

const PH = 0.7; // platform height
const NY = 1.0; // node row
const SLOT = 2.9;
const ADDR: Record<number, string> = { 12: '0x2C', 27: '0x58', 45: '0x14', 33: '0x70' };

interface NodeAt {
  v: number;
  slot: number;
  /** Lifted off the row (a node not linked in yet, or one being dropped). */
  aside?: boolean;
  tone?: BoxTone;
}
interface Link {
  from: number;
  to: number | null;
  tone?: 'ink' | 'coral' | 'faint';
  dashed?: boolean;
}
interface State {
  nodes: NodeAt[];
  links: Link[];
  pointer?: { name: string; at: number };
  width?: number;
}

const nodeX = (n: NodeAt) => 0.7 + n.slot * SLOT;
const nodeY = (n: NodeAt) => (n.aside ? -1.9 : NY);

function scene(s: State): SceneObj[] {
  const objs: SceneObj[] = [slab('platform', 0, 0, s.width ?? 9.6, 3, PH, { side: 'LINKED LIST' })];
  const byV = new Map(s.nodes.map((n) => [n.v, n]));
  for (const n of s.nodes) {
    const x = nodeX(n),
      y = nodeY(n);
    const dim = n.tone === 'dim';
    objs.push(box(`n${n.v}`, x, y, PH, String(n.v), n.tone ?? 'plain', { w: 1, d: 1.1, h: 1 }));
    objs.push(box(`p${n.v}`, x + 1, y, PH, undefined, dim ? 'dim' : 'pink', { w: 0.75, d: 1.1, h: 1 }));
  }
  for (const l of s.links) {
    const a = byV.get(l.from)!;
    const start: Vec3 = [nodeX(a) + 1.375, nodeY(a) + 0.55, PH + 1];
    let end: Vec3;
    if (l.to === null) end = [nodeX(a) + 2.6, nodeY(a) + 0.55, PH + 1];
    else {
      const b = byV.get(l.to)!;
      end = [nodeX(b) + 0.15, nodeY(b) + 0.55, PH + 1];
    }
    objs.push(edge(`l${l.from}`, start, end, { arrow: true, over: true, dot: true, tone: l.tone, dashed: l.dashed }));
    if (l.to === null) objs.push(tag('null', [end[0] + 0.25, end[1], end[2]], 'null', { tone: 'light', dx: 22, dy: 6, leader: false }));
  }
  const head = s.nodes.find((n) => n.slot === 0 && !n.aside)!;
  objs.push(tag('head', [nodeX(head) + 0.5, NY + 0.2, PH + 1], 'head', { dx: -60, dy: -60 }));
  if (s.pointer) {
    const n = byV.get(s.pointer.at)!;
    objs.push(tag('ptr', [nodeX(n) + 0.5, nodeY(n) + 1.1, PH + 0.3], s.pointer.name, { tone: 'coral', dy: 58 }));
  }
  return objs;
}

function memory(next: Record<number, number | null>, place: Record<number, number | '—'>, hot: number[] = [], dropped: number[] = []): Panel {
  const order = [45, 12, 27, 33].filter((v) => v in next);
  return {
    type: 'table',
    title: 'In memory',
    badge: 'head 0x2C',
    cols: ['ADDRESS', 'VALUE', 'NEXT', 'PLACE IN LIST'],
    rows: order.map((v) => ({
      cells: [ADDR[v], String(v), next[v] === null ? 'null' : ADDR[next[v] as number], String(place[v])],
      hot: hot.includes(v) ? [2] : [],
      dim: dropped.includes(v),
    })),
  };
}

const base: NodeAt[] = [
  { v: 12, slot: 0 },
  { v: 27, slot: 1 },
  { v: 45, slot: 2 },
];
const chain: Link[] = [
  { from: 12, to: 27 },
  { from: 27, to: 45 },
  { from: 45, to: null },
];
const next0 = { 12: 27, 27: 45, 45: null };
const place0 = { 12: 1, 27: 2, 45: 3 };

export const linkedLists: Lesson = {
  id: 'linked-lists',
  title: 'Singly Linked Lists',
  code: [
    'get(head, k):',
    '    cur ← head',
    '    repeat k times:',
    '        cur ← cur.next',
    '    return cur',
    '',
    'insert_after(prev, value):',
    '    node ← a new node holding value',
    '    node.next ← prev.next',
    '    prev.next ← node',
    '',
    'delete_after(prev):',
    '    prev.next ← prev.next.next',
  ],
  steps: [
    {
      title: 'A chain of nodes',
      tag: 'Concept',
      body: [
        'A linked list stores each value in its own **node**. Next to the value sits a pointer: the address of the next node.',
        'The nodes can live anywhere in memory. Only **head** is known up front; the last node points at null.',
      ],
      note: { kind: 'picture', text: 'A treasure hunt: every clue tells you where the next clue is hidden.' },
      scene: scene({ nodes: base, links: chain }),
      panels: [memory(next0, place0)],
    },
    {
      title: 'Follow the pointers',
      tag: 'Read',
      body: ['To reach the third node you cannot jump there. Start at head and follow next twice: 12 → 27 → 45.', 'Reaching position k takes k hops, so reading by position is **O(n)**. An array would do it in one step.'],
      lines: [1, 2, 3, 4, 5],
      scene: scene({ nodes: base, links: chain.map((l) => (l.to ? { ...l, tone: 'coral' } : l)), pointer: { name: 'cur', at: 45 } }),
      panels: [memory(next0, place0)],
    },
    {
      title: 'A new node',
      tag: 'Insert · 1 of 3',
      body: ['Let us put **33** between 27 and 45. First, make a node for it somewhere in memory, at 0x70.', 'It is not part of the list yet: nothing points to it.'],
      lines: [7, 8],
      scene: scene({ nodes: [...base, { v: 33, slot: 1.5, aside: true, tone: 'soft' }], links: chain, pointer: { name: 'prev', at: 27 } }),
      panels: [memory({ ...next0, 33: null }, { ...place0, 33: '—' })],
    },
    {
      title: 'Point it forward',
      tag: 'Insert · 2 of 3',
      body: ['Copy 27’s pointer into the new node: **node.next ← prev.next**. Now 33 points at 45.', 'Order matters. Doing this first means 45 is never lost, even for a moment.'],
      lines: [9],
      scene: scene({
        nodes: [...base, { v: 33, slot: 1.5, aside: true, tone: 'soft' }],
        links: [...chain, { from: 33, to: 45, tone: 'coral', dashed: true }],
        pointer: { name: 'prev', at: 27 },
      }),
      panels: [memory({ ...next0, 33: 45 }, { ...place0, 33: '—' }, [33])],
    },
    {
      title: 'Re-link',
      tag: 'Insert · 3 of 3',
      body: ['Now point 27 at the new node: **prev.next ← node**. The list reads 12 → 27 → 33 → 45.', 'The drawing makes room, but look at the table: no node changed address. Two pointer writes did it all. An array would have had to shift 45 along.'],
      note: { kind: 'cost', text: 'O(1) once you are standing at the spot.' },
      lines: [10],
      scene: scene({
        nodes: [{ v: 12, slot: 0 }, { v: 27, slot: 1 }, { v: 33, slot: 2, tone: 'soft' }, { v: 45, slot: 3 }],
        links: [{ from: 12, to: 27 }, { from: 27, to: 33, tone: 'coral', dashed: true }, { from: 33, to: 45 }, { from: 45, to: null }],
        pointer: { name: 'prev', at: 27 },
        width: 12.5,
      }),
      panels: [memory({ 12: 27, 27: 33, 33: 45, 45: null }, { 12: 1, 27: 2, 33: 3, 45: 4 }, [27])],
    },
    {
      title: 'Delete by bypass',
      tag: 'Delete',
      body: ['To remove 33, make 27 skip over it: **prev.next ← prev.next.next**. One write.', 'Nothing points at 33 any more, so it is out of the list. Its memory can be reused.'],
      lines: [12, 13],
      scene: scene({
        nodes: [{ v: 12, slot: 0 }, { v: 27, slot: 1 }, { v: 33, slot: 1.5, aside: true, tone: 'dim' }, { v: 45, slot: 2 }],
        links: [{ from: 12, to: 27 }, { from: 27, to: 45, tone: 'coral' }, { from: 33, to: 45, tone: 'faint', dashed: true }, { from: 45, to: null }],
        pointer: { name: 'prev', at: 27 },
      }),
      panels: [memory({ 12: 27, 27: 45, 33: 45, 45: null }, { 12: 1, 27: 2, 33: '—', 45: 3 }, [27], [33])],
    },
    {
      title: 'What you trade',
      tag: 'Summary',
      body: ['Linked lists are cheap to change in the middle and to grow, because nothing ever shifts.', 'They are slow to index, and every node pays for an extra pointer. Arrays make the opposite trade.'],
      scene: scene({ nodes: base, links: chain }),
      panels: [
        {
          type: 'rows',
          title: 'List vs array',
          rows: [
            { label: 'Get item k', values: [{ v: 'O(n)', state: 'soft' }, 'O(1)'] },
            { label: 'Insert at a known spot', values: [{ v: 'O(1)', state: 'hot' }, 'O(n)'] },
            { label: 'Extra memory', sub: 'per item', values: [{ v: '1 pointer', state: 'soft' }, 'none'] },
          ],
          foot: 'Left: linked list. Right: array.',
        },
      ],
    },
  ],
};
