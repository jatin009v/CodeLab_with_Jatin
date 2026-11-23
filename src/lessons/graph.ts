import { box, edge, tag } from '../iso/build';
import { flat } from '../iso/project';
import type { BoxObj, BoxTone, EdgeObj, SceneObj, Vec3 } from '../iso/types';

/** Shared helpers for lessons drawn as node-and-edge pictures on the floor. */

export const NODE = 1.2;

export function node(id: string, u: number, v: number, label: string, tone: BoxTone = 'plain', extra: Partial<BoxObj> = {}): BoxObj {
  const { x, y } = flat(u, v);
  return box(id, x - NODE / 2, y - NODE / 2, 0, label, tone, { w: NODE, d: NODE, h: NODE, ...extra });
}

/** Mid-height centre: edges run between nodes at this height so they read as lying on the floor. */
export const centre = (b: BoxObj): Vec3 => [b.x + (b.w ?? 1) / 2, b.y + (b.d ?? 1) / 2, (b.h ?? 1) * 0.5];
export const topCentre = (b: BoxObj): Vec3 => [b.x + (b.w ?? 1) / 2, b.y + (b.d ?? 1) / 2, b.h ?? 1];

export function link(id: string, a: BoxObj, b: BoxObj, extra: Partial<EdgeObj> = {}): EdgeObj {
  return edge(id, centre(a), centre(b), extra);
}

export function badge(id: string, b: BoxObj, text: string, tone: 'coral' | 'dark' | 'light' = 'coral'): SceneObj {
  return tag(id, topCentre(b), text, { tone, dy: -40, leader: false, size: 16, mono: text.length > 1 });
}
