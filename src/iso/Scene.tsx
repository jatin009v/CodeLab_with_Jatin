import { useEffect, useId, useRef, useState } from 'react';
import { COS, depthOf, layerOf, r, sceneBounds, SIN, UNIT } from './project';
import { renderObj, SceneDefs } from './shapes';
import type { SceneObj } from './types';

type Box4 = [number, number, number, number];

const DURATION = 720;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const prefersReducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Interpolate every numeric field (and numeric tuples) of two versions of the same object. */
function mix<T extends SceneObj>(from: T, to: T, t: number): T {
  const out: Record<string, unknown> = { ...to };
  const f = from as unknown as Record<string, unknown>;
  for (const [k, v] of Object.entries(to)) {
    const a = f[k];
    if (typeof v === 'number' && typeof a === 'number') out[k] = lerp(a, v, t);
    else if (Array.isArray(v) && Array.isArray(a) && v.length === a.length && typeof v[0] === 'number')
      out[k] = v.map((n: number, i: number) => lerp(a[i] as number, n, t));
  }
  if (to.o !== undefined || from.o !== undefined) out.o = lerp(from.o ?? 1, to.o ?? 1, t);
  return out as unknown as T;
}

/** How an object looks just before it appears: transparent, boxes drop in from above. */
function entering(o: SceneObj): SceneObj {
  if (o.kind === 'box') return { ...o, o: 0, z: o.z + 1.4 };
  if (o.kind === 'tag' || o.kind === 'panel') return { ...o, o: 0, dy: (o.dy ?? 0) - 10 };
  return { ...o, o: 0 };
}
function leaving(o: SceneObj): SceneObj {
  if (o.kind === 'box') return { ...o, o: 0, z: o.z + 0.8 };
  return { ...o, o: 0 };
}

/** Keep a minimum zoom-out so a lone block does not fill the whole stage. */
const MIN_W = 760;
const MIN_H = 470;
function fit(b: Box4): Box4 {
  let [x, y, w, h] = b;
  if (w < MIN_W) {
    x -= (MIN_W - w) / 2;
    w = MIN_W;
  }
  if (h < MIN_H) {
    y -= (MIN_H - h) / 2;
    h = MIN_H;
  }
  return [x, y, w, h];
}

function sorted(objs: SceneObj[]) {
  return [...objs].sort((a, b) => layerOf(a) - layerOf(b) || depthOf(a) - depthOf(b));
}

interface Props {
  objects: SceneObj[];
  label?: string;
  /** Draw the isometric floor grid. */
  grid?: boolean;
  /** Skip animation (thumbnails). */
  still?: boolean;
  className?: string;
  pad?: number;
}

/**
 * Renders a list of scene objects as an isometric SVG drawing and animates between
 * successive lists: objects are matched by id, numeric properties are interpolated,
 * new objects fade/drop in, removed ones fade out.
 */
export function Scene({ objects, label = 'Isometric diagram', grid = true, still = false, className, pad = 36 }: Props) {
  const prefix = 'sc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [frame, setFrame] = useState<{ objs: SceneObj[]; view: Box4 }>(() => ({ objs: objects, view: still ? sceneBounds(objects, pad) : fit(sceneBounds(objects, pad)) }));
  const current = useRef(frame);
  current.current = frame;

  useEffect(() => {
    const target = still ? sceneBounds(objects, pad) : fit(sceneBounds(objects, pad));
    if (still || prefersReducedMotion()) {
      setFrame({ objs: objects, view: target });
      return;
    }
    const start = current.current;
    const before = new Map(start.objs.map((o) => [o.id, o]));
    const after = new Map(objects.map((o) => [o.id, o]));
    const pairs: [SceneObj, SceneObj][] = [];
    for (const o of objects) pairs.push([before.get(o.id) ?? entering(o), o]);
    for (const o of start.objs) if (!after.has(o.id)) pairs.push([o, leaving(o)]);

    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION);
      const e = ease(t);
      const objs = pairs.map(([a, b]) => (a === b ? b : mix(a, b, e))).filter((o) => (o.o ?? 1) > 0.002 || t < 1);
      const view = start.view.map((v, i) => lerp(v, target[i], e)) as Box4;
      setFrame({ objs: t < 1 ? objs : objects, view: t < 1 ? view : target });
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects, still, pad]);

  const [vx, vy, vw, vh] = frame.view;
  const cw = 2 * COS * UNIT;
  const ch = 2 * SIN * UNIT;

  return (
    <svg className={`scene ${className ?? ''}`} viewBox={`${r(vx)} ${r(vy)} ${r(vw)} ${r(vh)}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      <SceneDefs prefix={prefix} />
      {grid && (
        <>
          <defs>
            <pattern id={`${prefix}-floor`} x={r(-cw / 2)} y={0} width={r(cw)} height={r(ch)} patternUnits="userSpaceOnUse">
              <path className="floor-line" d={`M0 ${r(ch / 2)}L${r(cw / 2)} 0L${r(cw)} ${r(ch / 2)}L${r(cw / 2)} ${r(ch)}Z`} />
            </pattern>
          </defs>
          <rect x={-4000} y={-3000} width={8000} height={6000} fill={`url(#${prefix}-floor)`} />
        </>
      )}
      {sorted(frame.objs).map((o) => (
        <g key={o.id} opacity={o.o === undefined ? undefined : r(Math.max(0, Math.min(1, o.o)))}>
          {renderObj(o, prefix)}
        </g>
      ))}
    </svg>
  );
}
