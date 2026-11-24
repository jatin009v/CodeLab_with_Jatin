import type { Lesson } from './types';
import { binarySearch } from './binary-search';
import { breadthFirstSearch } from './breadth-first-search';
import { divideAndConquer } from './divide-and-conquer';
import { huffmanCoding } from './huffman-coding';
import { linkedLists } from './linked-lists';
import { pVsNp } from './p-vs-np';
import { quickSort } from './quick-sort';
import { stacks } from './stacks';

// Newly implemented interactive lessons
import { bigO, memory, recursion } from './foundations';
import { arrays, twoPointers, slidingWindow } from './arrays-strings';
import { queues } from './queues';
import { binaryTrees, treeTraversals } from './trees';
import { mergeSort } from './merge-sort';
import { depthFirstSearch } from './depth-first-search';

/** Lessons that have a full walkthrough. Every other course entry shows a placeholder page. */
export const lessons: Record<string, Lesson> = Object.fromEntries(
  [
    // Foundations (100% complete)
    bigO,
    memory,
    recursion,
    divideAndConquer,

    // Arrays & Strings
    arrays,
    twoPointers,
    slidingWindow,

    // Linked Lists
    linkedLists,

    // Stacks & Queues
    stacks,
    queues,

    // Trees
    binaryTrees,
    treeTraversals,

    // Graphs
    breadthFirstSearch,
    depthFirstSearch,

    // Sorting & Searching
    binarySearch,
    quickSort,
    mergeSort,

    // Advanced
    huffmanCoding,
    pVsNp,
  ].map((l) => [l.id, l]),
);
