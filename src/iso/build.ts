import type { BoxObj, BoxTone, EdgeObj, SlabObj, TagObj, Vec3 } from './types';

/** Small constructors so lesson files read like a description of the drawing. */

export function box(id: string, x: number, y: number, z: number, label?: string, tone: BoxTone = 'plain', extra: Partial<BoxObj> = {}): BoxObj {
  return { kind: 'box', id, x, y, z, label, tone, ...extra };
}

export function slab(id: string, x: number, y: number, w: number, d: number, h: number, extra: Partial<SlabObj> = {}): SlabObj {
  return { kind: 'slab', id, x, y, w, d, h, ...extra };
}

export function edge(id: string, a: Vec3, b: Vec3, extra: Partial<EdgeObj> = {}): EdgeObj {
  return { kind: 'edge', id, a, b, ...extra };
}

export function tag(id: string, at: Vec3, text: string, extra: Partial<TagObj> = {}): TagObj {
  return { kind: 'tag', id, at, text, ...extra };
}

/** Top-centre of a box: where edges between nodes attach. */
export function topOf(b: BoxObj): Vec3 {
  return [b.x + (b.w ?? 1) / 2, b.y + (b.d ?? 1) / 2, b.z + (b.h ?? 1)];
}

/** Centre of a box at mid-height: for edges that should run "through" nodes. */
export function midOf(b: BoxObj): Vec3 {
  return [b.x + (b.w ?? 1) / 2, b.y + (b.d ?? 1) / 2, b.z + (b.h ?? 1) / 2];
}
