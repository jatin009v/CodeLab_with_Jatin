import type { SceneObj } from '../iso/types';

export type NoteKind = 'picture' | 'needs' | 'cost' | 'compare' | 'aside' | 'watch';

export interface Note {
  kind: NoteKind;
  /** Optional label override (defaults per kind). */
  label?: string;
  text: string;
}

export type ChipState = 'plain' | 'dim' | 'hot' | 'soft';
export interface Chip {
  v: string;
  state?: ChipState;
}

export type Panel =
  | {
      type: 'rows';
      title: string;
      badge?: string;
      rows: { label: string; sub?: string; values: (string | Chip)[]; hot?: boolean }[];
      foot?: string;
    }
  | {
      type: 'chips';
      title: string;
      badge?: string;
      chips: Chip[];
      big?: string;
      text?: string;
      trail?: string[];
    }
  | {
      type: 'bars';
      title: string;
      sub?: string;
      bars: { label: string; suffix?: string; value: string; frac: number }[];
    }
  | {
      type: 'table';
      title: string;
      badge?: string;
      cols: string[];
      rows: { cells: string[]; hot?: number[]; dim?: boolean }[];
    };

export interface Step {
  title: string;
  /** Small chip in the corner of the step card: CONCEPT, STEP, RESULT… */
  tag: string;
  /** Paragraphs. **double asterisks** mark bold words. */
  body: string[];
  note?: Note;
  /** 1-based pseudocode lines to highlight. */
  lines?: number[];
  scene: SceneObj[];
  panels?: Panel[];
}

export interface Lesson {
  id: string;
  title: string;
  code: string[];
  steps: Step[];
}
