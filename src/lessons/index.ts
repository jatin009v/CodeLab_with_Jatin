import type { Lesson } from './types';
import { binarySearch } from './binary-search';
import { breadthFirstSearch } from './breadth-first-search';
import { divideAndConquer } from './divide-and-conquer';
import { huffmanCoding } from './huffman-coding';
import { linkedLists } from './linked-lists';
import { pVsNp } from './p-vs-np';
import { quickSort } from './quick-sort';
import { stacks } from './stacks';

/** Lessons that have a full walkthrough. Every other course entry shows a placeholder page. */
export const lessons: Record<string, Lesson> = Object.fromEntries(
  [divideAndConquer, linkedLists, stacks, breadthFirstSearch, binarySearch, quickSort, huffmanCoding, pVsNp].map((l) => [l.id, l]),
);
