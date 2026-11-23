import type { SceneObj, Vec3 } from './types';

/** Pixels per grid unit. */
export const UNIT = 40;
/** Floor angle of the projection (2:1 dimetric, the classic "isometric" pixel look). */
const ANGLE = Math.atan(0.5);
export const COS = Math.cos(ANGLE);
export const SIN = Math.sin(ANGLE);
/** Height of one vertical unit on screen. */
export const ZUNIT = UNIT * 0.92;

export type Pt = [number, number];

export function project(x: number, y: number, z = 0): Pt {
  return [(x - y) * COS * UNIT, (x + y) * SIN * UNIT - z * ZUNIT];
}

export const projectV = (v: Vec3): Pt => project(v[0], v[1], v[2]);

/**
 * Place something on the floor using screen-like coordinates:
 * u runs left → right, v runs top → bottom (both in grid-ish units).
 * Handy for trees and graphs, which are easier to think of as 2D drawings.
 */
export function flat(u: number, v: number): { x: number; y: number } {
  return { x: (u + v) / 2, y: (v - u) / 2 };
}

export const pts = (list: Pt[]) => list.map(([a, b]) => `${r(a)},${r(b)}`).join(' ');
export const r = (n: number) => Math.round(n * 100) / 100;

/** Painter's order: lower layers first, then back to front. */
export function layerOf(o: SceneObj): number {
  switch (o.kind) {
    case 'slab':
    case 'tile':
      return 0;
    case 'wire':
      return 1;
    case 'edge':
      return o.over ? 3 : 1;
    case 'box':
      return 2;
    default:
      return 4;
  }
}

export function depthOf(o: SceneObj): number {
  switch (o.kind) {
    case 'box': {
      const w = o.w ?? 1;
      const d = o.d ?? 1;
      return o.x + w / 2 + (o.y + d / 2) + o.z * 0.01;
    }
    case 'slab':
    case 'tile':
      return o.x + o.y + (o.z ?? 0) * 0.01;
    case 'wire':
      return o.x + o.y;
    case 'edge':
      return (o.a[0] + o.a[1] + o.b[0] + o.b[1]) / 2;
    default:
      return 0;
  }
}

/** Screen-space bounding box of an object (generous for labels). */
export function boundsOf(o: SceneObj): [number, number, number, number] | null {
  const acc: Pt[] = [];
  const cube = (x: number, y: number, z: number, w: number, d: number, h: number) => {
    for (const [a, b, c] of [
      [x, y, z],
      [x + w, y, z],
      [x, y + d, z],
      [x + w, y + d, z],
      [x, y, z + h],
      [x + w, y, z + h],
      [x, y + d, z + h],
      [x + w, y + d, z + h],
    ])
      acc.push(project(a, b, c));
  };
  switch (o.kind) {
    case 'box':
      cube(o.x, o.y, o.z, o.w ?? 1, o.d ?? 1, o.h ?? 1);
      break;
    case 'slab':
      cube(o.x, o.y, o.z ?? 0, o.w, o.d, o.h);
      break;
    case 'wire':
      cube(o.x, o.y, o.z, o.w, o.d, o.h);
      break;
    case 'tile':
      cube(o.x, o.y, o.z, o.w, o.d, 0);
      break;
    case 'edge':
      acc.push(projectV(o.a), projectV(o.b));
      break;
    case 'tag': {
      const [px, py] = projectV(o.at);
      const cx = px + (o.dx ?? 0);
      const cy = py + (o.dy ?? 0);
      const hw = tagWidth(o.text, o.size ?? 15) / 2;
      acc.push([px, py], [cx - hw, cy - 18], [cx + hw, cy + 18]);
      break;
    }
    case 'panel': {
      const [px, py] = projectV(o.at);
      const x0 = px + (o.dx ?? 0);
      const y0 = py + (o.dy ?? 0);
      acc.push([px, py], [x0, y0], [x0 + PANEL_W, y0 + panelHeight(o.items.length)]);
      break;
    }
  }
  if (!acc.length) return null;
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const [a, b] of acc) {
    x0 = Math.min(x0, a);
    y0 = Math.min(y0, b);
    x1 = Math.max(x1, a);
    y1 = Math.max(y1, b);
  }
  return [x0, y0, x1, y1];
}

export const PANEL_W = 190;
export const panelHeight = (n: number) => 44 + n * 36 + 10;

export function tagWidth(text: string, size: number) {
  return Math.max(34, text.length * size * 0.58 + 24);
}

export function sceneBounds(objs: SceneObj[], pad = 36): [number, number, number, number] {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const o of objs) {
    if ((o.o ?? 1) <= 0.01) continue;
    const b = boundsOf(o);
    if (!b) continue;
    x0 = Math.min(x0, b[0]);
    y0 = Math.min(y0, b[1]);
    x1 = Math.max(x1, b[2]);
    y1 = Math.max(y1, b[3]);
  }
  if (!isFinite(x0)) return [-200, -150, 400, 300];
  return [x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2];
}
