import type { ReactNode } from 'react';
import { COS, SIN, PANEL_W, panelHeight, project, projectV, pts, r, tagWidth, UNIT } from './project';
import type { BoxObj, EdgeObj, PanelObj, SceneObj, SlabObj, TagObj, TileObj, WireObj } from './types';

/** Shared <defs>: hatch patterns and arrow heads. Ids are prefixed per scene. */
export function SceneDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      <pattern id={`${prefix}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-50)">
        <rect width="7" height="7" className="hatch-bg" />
        <rect width="3.2" height="7" className="hatch-fg" />
      </pattern>
      <pattern id={`${prefix}-hatch-dim`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-50)">
        <rect width="7" height="7" className="hatch-dim-bg" />
        <rect width="2.4" height="7" className="hatch-dim-fg" />
      </pattern>
      <marker id={`${prefix}-arrow`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10Z" className="arrow-ink" />
      </marker>
      <marker id={`${prefix}-arrow-coral`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10Z" className="arrow-coral" />
      </marker>
    </defs>
  );
}

/** Text laid flat on the front-left face (the face that runs along +x). */
function faceText(cx: number, cy: number, text: string, size: number, cls: string, spacing = 0) {
  return (
    <text
      className={cls}
      transform={`matrix(${r(COS)} ${r(SIN)} 0 1 ${r(cx)} ${r(cy)})`}
      fontSize={size}
      letterSpacing={spacing}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {text}
    </text>
  );
}

function renderBox(o: BoxObj, p: string) {
  const w = o.w ?? 1,
    d = o.d ?? 1,
    h = o.h ?? 1;
  const { x, y, z } = o;
  const tone = o.tone ?? 'plain';
  const P = project;
  const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const left = [P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)];
  const right = [P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)];
  const dim = tone === 'dim';
  const [lx, ly] = P(x + w / 2, y + d, z + h / 2);
  const [tx, ty] = P(x + w / 2, y + d / 2, z + h);
  const size = o.labelSize ?? Math.min(26, 13 + Math.min(w, h) * 12) * (o.label && o.label.length > 3 ? 0.78 : 1);
  return (
    <g className={`box box--${tone}`}>
      {o.ring && (
        <polygon
          className="ring"
          points={pts([P(x - 0.22, y - 0.22, z), P(x + w + 0.22, y - 0.22, z), P(x + w + 0.22, y + d + 0.22, z), P(x - 0.22, y + d + 0.22, z)])}
        />
      )}
      <polygon className="face face-top" points={pts(top)} />
      <polygon className="face face-left" points={pts(left)} />
      <polygon className="face face-right" points={pts(right)} fill={`url(#${p}-${dim ? 'hatch-dim' : 'hatch'})`} />
      {o.label && faceText(lx, ly, o.label, size, 'box-label')}
      {o.dot && <ellipse className="box-dot" cx={r(tx)} cy={r(ty)} rx={7} ry={7} />}
    </g>
  );
}

function renderSlab(o: SlabObj, p: string) {
  const { x, y, w, d, h } = o;
  const z = o.z ?? 0;
  const P = project;
  const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const left = [P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)];
  const right = [P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)];
  const inset = Math.min(0.45, Math.min(w, d) * 0.14);
  const [sx, sy] = P(x + w / 2, y + d, z + h / 2);
  return (
    <g className={`slab slab--${o.tone ?? 'dark'}`}>
      <polygon className="face slab-top" points={pts(top)} />
      {o.tray && (
        <>
          <polygon
            className="face tray"
            fill={`url(#${p}-hatch)`}
            points={pts([P(x + inset, y + inset, z + h), P(x + w - inset, y + inset, z + h), P(x + w - inset, y + d - inset, z + h), P(x + inset, y + d - inset, z + h)])}
          />
          <polygon
            className="face slab-top"
            points={pts([
              P(x + inset * 2.4, y + inset * 2.4, z + h),
              P(x + w - inset * 2.4, y + inset * 2.4, z + h),
              P(x + w - inset * 2.4, y + d - inset * 2.4, z + h),
              P(x + inset * 2.4, y + d - inset * 2.4, z + h),
            ])}
          />
        </>
      )}
      {o.lane && (
        <polygon
          className="lane"
          points={pts([P(o.lane.from, y + d * 0.25, z + h), P(o.lane.to, y + d * 0.25, z + h), P(o.lane.to, y + d * 0.75, z + h), P(o.lane.from, y + d * 0.75, z + h)])}
        />
      )}
      <polygon className="face slab-left" points={pts(left)} />
      <polygon className="face slab-right" points={pts(right)} fill={`url(#${p}-hatch)`} />
      {o.side && faceText(sx, sy, o.side, Math.min(20, h * UNIT * 0.42), 'slab-label', 3)}
      {o.ticks?.map((t) => {
        const [qx, qy] = P(t.x, y + d, z + h / 2);
        return <g key={t.text + t.x}>{faceText(qx, qy, t.text, Math.min(17, h * UNIT * 0.4), t.dim ? 'slab-tick slab-tick--dim' : 'slab-tick')}</g>;
      })}
    </g>
  );
}

function renderWire(o: WireObj) {
  const { x, y, z, w, d, h } = o;
  const c = (a: number, b: number, cz: number) => project(a, b, cz);
  const segs: [number, number, number, number, number, number][] = [];
  const corners: [number, number][] = [
    [x, y],
    [x + w, y],
    [x + w, y + d],
    [x, y + d],
  ];
  for (let i = 0; i < 4; i++) {
    const [a, b] = corners[i];
    const [a2, b2] = corners[(i + 1) % 4];
    segs.push([a, b, z + h, a2, b2, z + h]);
    segs.push([a, b, z, a, b, z + h]);
  }
  return (
    <g className="wire">
      {segs.map((s, i) => {
        const [x1, y1] = c(s[0], s[1], s[2]);
        const [x2, y2] = c(s[3], s[4], s[5]);
        return <line key={i} x1={r(x1)} y1={r(y1)} x2={r(x2)} y2={r(y2)} />;
      })}
    </g>
  );
}

function renderEdge(o: EdgeObj, p: string) {
  const [x1, y1] = projectV(o.a);
  const [x2, y2] = projectV(o.b);
  const tone = o.tone ?? 'ink';
  const mx = (x1 + x2) / 2,
    my = (y1 + y2) / 2;
  return (
    <g className={`edge edge--${tone}`}>
      <line
        x1={r(x1)}
        y1={r(y1)}
        x2={r(x2)}
        y2={r(y2)}
        strokeDasharray={o.dashed ? '9 7' : undefined}
        markerEnd={o.arrow ? `url(#${p}-${tone === 'coral' ? 'arrow-coral' : 'arrow'})` : undefined}
      />
      {o.dot && <circle className="edge-dot" cx={r(x1)} cy={r(y1)} r={6} />}
      {o.chip && (
        <g className={`chip chip--${o.chipTone ?? 'light'}`}>
          <rect x={r(mx - 19)} y={r(my - 17)} width={38} height={34} rx={7} />
          <text x={r(mx)} y={r(my)} textAnchor="middle" dominantBaseline="central">
            {o.chip}
          </text>
        </g>
      )}
    </g>
  );
}

function renderTag(o: TagObj) {
  const [px, py] = projectV(o.at);
  const dx = o.dx ?? 0,
    dy = o.dy ?? 0;
  const size = o.size ?? 15;
  const lines = o.text.split('\n');
  const wdt = Math.max(...lines.map((l) => tagWidth(l, size)));
  const hgt = size * 1.25 * lines.length + 16;
  const cx = px + dx,
    cy = py + dy;
  const leader = o.leader ?? (dx !== 0 || dy !== 0);
  return (
    <g className={`tag tag--${o.tone ?? 'dark'}${o.mono ? ' tag--mono' : ''}`}>
      {leader && (
        <>
          <line className="tag-leader" x1={r(px)} y1={r(py)} x2={r(cx)} y2={r(cy)} />
          <circle className="tag-pin" cx={r(px)} cy={r(py)} r={5} />
        </>
      )}
      <rect x={r(cx - wdt / 2)} y={r(cy - hgt / 2)} width={r(wdt)} height={r(hgt)} rx={7} />
      {lines.map((l, i) => (
        <text key={i} x={r(cx)} y={r(cy + (i - (lines.length - 1) / 2) * size * 1.25)} fontSize={size} textAnchor="middle" dominantBaseline="central">
          {l}
        </text>
      ))}
    </g>
  );
}

function renderPanel(o: PanelObj) {
  const [px, py] = projectV(o.at);
  const x0 = px + (o.dx ?? 0);
  const y0 = py + (o.dy ?? 0);
  const H = panelHeight(o.items.length);
  return (
    <g className="panel">
      {o.leader && (
        <>
          <polyline className="tag-leader" points={pts([[px, py], [x0 - 22, py], [x0 - 22, y0 + H * 0.4], [x0, y0 + H * 0.4]])} fill="none" />
          <circle className="tag-pin tag-pin--ink" cx={r(px)} cy={r(py)} r={5} />
          <circle className="tag-pin tag-pin--ink" cx={r(x0)} cy={r(y0 + H * 0.4)} r={5} />
        </>
      )}
      <rect className="panel-body" x={r(x0)} y={r(y0)} width={PANEL_W} height={H} rx={12} />
      <path className="panel-head" d={`M${r(x0)} ${r(y0 + 12)}a12 12 0 0 1 12 -12h${PANEL_W - 24}a12 12 0 0 1 12 12v24h-${PANEL_W}Z`} />
      <text className="panel-title" x={r(x0 + 18)} y={r(y0 + 19)} dominantBaseline="central">
        {o.title}
      </text>
      {o.items.map((it, i) => {
        const yy = y0 + 46 + i * 36;
        return (
          <g key={i} className={it.hot ? 'panel-row panel-row--hot' : 'panel-row'}>
            <rect x={r(x0 + 14)} y={r(yy)} width={PANEL_W - 28} height={30} rx={6} />
            <text className="panel-icon" x={r(x0 + 32)} y={r(yy + 15)} textAnchor="middle" dominantBaseline="central">
              {it.icon}
            </text>
            <text x={r(x0 + 52)} y={r(yy + 15)} dominantBaseline="central">
              {it.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function renderTile(o: TileObj, p: string) {
  const { x, y, z, w, d } = o;
  const P = project;
  return (
    <polygon
      className={`tile tile--${o.tone ?? 'hatch'}`}
      fill={o.tone === 'hatch' || !o.tone ? `url(#${p}-hatch)` : undefined}
      points={pts([P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)])}
    />
  );
}

export function renderObj(o: SceneObj, prefix: string): ReactNode {
  switch (o.kind) {
    case 'box':
      return renderBox(o, prefix);
    case 'slab':
      return renderSlab(o, prefix);
    case 'wire':
      return renderWire(o);
    case 'edge':
      return renderEdge(o, prefix);
    case 'tag':
      return renderTag(o);
    case 'panel':
      return renderPanel(o);
    case 'tile':
      return renderTile(o, prefix);
  }
}
