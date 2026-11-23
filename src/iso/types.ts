/** A point in scene space: x and y lie on the floor, z points up. One unit is one grid cell. */
export type Vec3 = [number, number, number];

/** How a box is painted. */
export type BoxTone =
  | 'plain' // paper faces, hatched right side
  | 'soft' // light coral top: "seen", "in the answer"
  | 'hot' // solid coral top: the item the step is about
  | 'pink' // pink front face (pointer cells, linked-list nodes)
  | 'dim'; // greyed out: thrown away, no longer relevant

interface Base {
  id: string;
  /** Opacity, 0..1 (default 1). Interpolated between steps. */
  o?: number;
}

export interface BoxObj extends Base {
  kind: 'box';
  x: number;
  y: number;
  z: number;
  w?: number;
  d?: number;
  h?: number;
  label?: string;
  labelSize?: number;
  tone?: BoxTone;
  /** A coral dot in the middle of the top face. */
  dot?: boolean;
  /** A coral outline on the floor around the box. */
  ring?: boolean;
}

export interface SlabObj extends Base {
  kind: 'slab';
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  /** Text printed along the dark front face. */
  side?: string;
  /** Small labels along the front face, placed at scene x positions. */
  ticks?: { x: number; text: string; dim?: boolean }[];
  /** Hatched tray inset on the top face. */
  tray?: boolean;
  /** A light coral lane on the top face (a "window"). */
  lane?: { from: number; to: number };
  tone?: 'dark' | 'light';
}

export interface WireObj extends Base {
  kind: 'wire';
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
}

export interface EdgeObj extends Base {
  kind: 'edge';
  a: Vec3;
  b: Vec3;
  tone?: 'ink' | 'coral' | 'faint';
  dashed?: boolean;
  arrow?: boolean;
  /** Draw above boxes instead of beneath them. */
  over?: boolean;
  /** Dot at the start point. */
  dot?: boolean;
  /** Small chip at the middle of the edge (a weight, a bit…). */
  chip?: string;
  chipTone?: 'light' | 'coral';
}

export interface TagObj extends Base {
  kind: 'tag';
  at: Vec3;
  text: string;
  tone?: 'dark' | 'coral' | 'light';
  /** Screen-space offset of the label from the anchor, in px. */
  dx?: number;
  dy?: number;
  /** Draw a leader line from the anchor to the label. */
  leader?: boolean;
  size?: number;
  mono?: boolean;
}

export interface PanelObj extends Base {
  kind: 'panel';
  at: Vec3;
  dx?: number;
  dy?: number;
  title: string;
  items: { icon: string; text: string; hot?: boolean }[];
  /** Index of a row whose left edge gets a connector to the anchor. */
  leader?: boolean;
}

export interface TileObj extends Base {
  kind: 'tile';
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  tone?: 'hatch' | 'coral' | 'soft';
}

export type SceneObj = BoxObj | SlabObj | WireObj | EdgeObj | TagObj | PanelObj | TileObj;
