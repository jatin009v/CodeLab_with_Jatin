import type { BoxTone, SceneObj } from '../iso/types';
import { badge, link, node } from './graph';
import type { Lesson, Panel } from './types';

type Pos = Record<string, [number, number]>;

const LETTERS = { A: 8, B: 3, C: 1, D: 1 };

interface State {
  pos: Pos;
  /** Inner nodes that exist: id → label (its weight). */
  inner: Record<string, string>;
  /** Parent → children. */
  kids: Record<string, [string, string]>;
  hot?: string[];
  codes?: boolean;
  bits?: boolean;
}

const CODES: Record<string, string> = { A: '0', B: '10', C: '110', D: '111' };

function scene(s: State): SceneObj[] {
  const boxes = new Map<string, ReturnType<typeof node>>();
  const tone = (id: string): BoxTone => (s.hot?.includes(id) ? 'hot' : s.codes && id in LETTERS ? 'hot' : 'plain');
  for (const [k, [u, v]] of Object.entries(s.pos)) {
    const label = k in LETTERS ? k : s.inner[k];
    if (label === undefined) continue;
    boxes.set(k, node(k, u, v, label, tone(k)));
  }
  const objs: SceneObj[] = [];
  for (const [p, [l, r]] of Object.entries(s.kids)) {
    const P = boxes.get(p)!;
    objs.push(link(`${p}-${l}`, P, boxes.get(l)!, s.bits ? { chip: '0' } : {}));
    objs.push(link(`${p}-${r}`, P, boxes.get(r)!, s.bits ? { chip: '1' } : {}));
  }
  objs.push(...boxes.values());
  for (const k of Object.keys(LETTERS)) {
    const b = boxes.get(k)!;
    objs.push(s.codes ? badge(`t${k}`, b, CODES[k]) : badge(`t${k}`, b, `×${LETTERS[k as keyof typeof LETTERS]}`, 'light'));
  }
  return objs;
}

function codesPanel(codes: Record<string, string>, bits: number, foot: string): Panel {
  return {
    type: 'rows',
    title: 'The codes',
    rows: [
      ...Object.entries(LETTERS).map(([k, n]) => ({ label: k, sub: `appears ${n}×`, values: [codes[k]] })),
      { label: 'Bits for the message', values: [String(bits)], hot: true },
    ],
    foot,
  };
}
const fixed = { A: '00', B: '01', C: '10', D: '11' };

const row: Pos = { A: [-9, 6], B: [-3, 6], C: [3, 6], D: [9, 6] };
const p2: Pos = { A: [-9, 6], B: [-3, 6], C: [3, 6], D: [9, 6], n2: [6, 1.5] };
const p5: Pos = { A: [-9, 6], B: [-3, 6], C: [3, 6], D: [9, 6], n2: [6, 1.5], n5: [1.5, -2.5] };
const tree: Pos = { A: [-9, 2], n13: [-4, -3], n5: [1, 1], B: [-2.5, 5], n2: [5, 5], C: [2, 9], D: [8, 9] };

export const huffmanCoding: Lesson = {
  id: 'huffman-coding',
  title: 'Huffman Coding',
  code: [
    'huffman(letters):',
    '    put every letter in a min-heap, by count',
    '    while the heap holds more than one node:',
    '        a ← pop the smallest',
    '        b ← pop the smallest',
    '        push a new node worth a + b,',
    '            with a and b as its children',
    '    return the last node          // the root',
    '',
    'code(letter):',
    '    walk from the root down to the letter:',
    '        left adds a 0, right adds a 1',
  ],
  steps: [
    {
      title: 'Short codes for common letters',
      tag: 'Problem',
      body: [
        'A 13-letter message uses only four letters: A eight times, B three times, C and D once each. Giving every letter a 2-bit code takes 26 bits.',
        'It would be shorter if A, which is most of the message, had a 1-bit code, at the price of longer codes for the rare letters. **Huffman coding** finds the best trade.',
      ],
      lines: [1, 2],
      scene: scene({ pos: row, inner: {}, kids: {} }),
      panels: [codesPanel(fixed, 26, 'Two bits each.')],
    },
    {
      title: 'Join the two rarest',
      tag: 'Greedy',
      body: ['Take the two rarest letters, C and D (once each), and hang them under a new node worth 1 + 1 = **2**.', 'From now on that pair is treated as a single item with count 2.'],
      lines: [3, 4, 5, 6, 7],
      scene: scene({ pos: p2, inner: { n2: '2' }, kids: { n2: ['C', 'D'] }, hot: ['n2'] }),
      panels: [codesPanel(fixed, 26, 'Nothing has changed yet: the tree is still growing.')],
    },
    {
      title: 'And again',
      tag: 'Greedy',
      body: ['The two smallest now are the new node (2) and B (3). Join them under a node worth **5**.', 'Each join pushes the rare letters one level deeper, which is where long codes belong.'],
      lines: [3, 4, 5, 6, 7],
      scene: scene({ pos: p5, inner: { n2: '2', n5: '5' }, kids: { n2: ['C', 'D'], n5: ['B', 'n2'] }, hot: ['n5'] }),
      panels: [codesPanel(fixed, 26, 'Still growing.')],
    },
    {
      title: 'Until one tree is left',
      tag: 'Greedy',
      body: ['Last join: A (8) and the 5 node make the root, worth **13**, the length of the message.', 'Only one node is left, so the loop stops. That node is the root of the code tree.'],
      lines: [3, 8],
      scene: scene({ pos: tree, inner: { n2: '2', n5: '5', n13: '13' }, kids: { n2: ['C', 'D'], n5: ['B', 'n2'], n13: ['A', 'n5'] }, hot: ['n13'] }),
      panels: [codesPanel(fixed, 26, 'The tree is done. Now read the codes off it.')],
    },
    {
      title: 'Read the codes off the branches',
      tag: 'Result',
      body: ['Going left is a 0 and going right is a 1. A letter’s code is the path to it from the root.', 'A is 0, B is 10, C is 110 and D is 111. The message takes 8 × 1 + 3 × 2 + 1 × 3 + 1 × 3 = **20 bits**, down from 26.'],
      lines: [10, 11, 12],
      scene: scene({ pos: tree, inner: { n2: '2', n5: '5', n13: '13' }, kids: { n2: ['C', 'D'], n5: ['B', 'n2'], n13: ['A', 'n5'] }, codes: true, bits: true }),
      panels: [codesPanel(CODES, 20, 'Six bits saved on thirteen letters.')],
    },
    {
      title: 'No commas needed',
      tag: 'Why it works',
      body: [
        'Letters only sit at the ends of branches, so no code is the start of another one. That is called a **prefix-free** code.',
        'Reading 0 10 110 0 bit by bit, each letter is complete the moment you reach a leaf: A, B, C, A. No separators are needed.',
      ],
      note: { kind: 'aside', text: 'ZIP, PNG and JPEG all use Huffman coding as one of their stages.' },
      scene: scene({ pos: tree, inner: { n2: '2', n5: '5', n13: '13' }, kids: { n2: ['C', 'D'], n5: ['B', 'n2'], n13: ['A', 'n5'] }, codes: true, bits: true }),
      panels: [codesPanel(CODES, 20, 'Greedy works here: joining the two rarest is always safe.')],
    },
  ],
};
