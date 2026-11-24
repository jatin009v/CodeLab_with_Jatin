import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Cpu, Lightbulb, ListOrdered, Eye, TriangleAlert, Zap, Scale } from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { allLessons, pad2, type LessonRef } from '../course';
import { Scene } from '../iso/Scene';
import type { SceneObj } from '../iso/types';
import { box, slab, tag } from '../iso/build';
import type { Chip, Lesson, NoteKind, Panel, Step } from '../lessons/types';

/* ---------- small pieces ---------- */

/** Renders **bold** spans inside a paragraph. */
export function rich(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>));
}

const NOTE: Record<NoteKind, { label: string; Icon: typeof Lightbulb }> = {
  picture: { label: 'Picture it', Icon: Lightbulb },
  needs: { label: 'Needs', Icon: TriangleAlert },
  cost: { label: 'Cost', Icon: Zap },
  compare: { label: 'Compare', Icon: Scale },
  aside: { label: 'By the way', Icon: Lightbulb },
  watch: { label: 'Watch out', Icon: Eye },
};

/** A tiny staircase drawn with the same engine: one block per lesson in the chapter. */
function ChapterIcon({ count, index }: { count: number; index: number }) {
  const objs = useMemo<SceneObj[]>(() => {
    const n = Math.max(count, 1);
    const d = Math.min(0.9, 6 / n);
    // Steps climb up and to the right: along -y on the floor.
    return Array.from({ length: n }, (_, i) =>
      box('s' + i, 0, -i * d, 0, undefined, i === index ? 'hot' : i < index ? 'soft' : 'plain', { w: 1.5, d, h: 0.3 + (i + 1) * Math.min(0.55, 2.2 / n), dot: i === index }),
    );
  }, [count, index]);
  return (
    <div className="chapter-icon" aria-hidden="true">
      <Scene objects={objs} grid={false} still pad={4} />
    </div>
  );
}

function ChipView({ c }: { c: string | Chip }) {
  const chip = typeof c === 'string' ? { v: c } : c;
  return <span className={`chip-ui chip-ui--${chip.state ?? 'plain'}`}>{chip.v}</span>;
}

function PanelView({ p }: { p: Panel }) {
  return (
    <section className="card side-card">
      <div className="side-head">
        {p.type === 'table' && <Cpu size={22} className="side-icon" />}
        <h3>{p.title}</h3>
        {'badge' in p && p.badge && <span className="badge-dark">{p.badge}</span>}
      </div>
      {p.type === 'rows' && (
        <>
          <div className="rows">
            {p.rows.map((row, i) => (
              <div key={i} className={`row${row.hot ? ' is-hot' : ''}`}>
                <span className="row-label">
                  {row.label}
                  {row.sub && <small>{row.sub}</small>}
                </span>
                <span className="row-values">
                  {row.values.map((v, j) => (
                    <ChipView key={j} c={row.hot && typeof v === 'string' && row.values.length === 1 ? { v, state: 'hot' } : v} />
                  ))}
                </span>
              </div>
            ))}
          </div>
          {p.foot && <p className="side-foot">{p.foot}</p>}
        </>
      )}
      {p.type === 'chips' && (
        <>
          <div className="chip-strip">
            {p.chips.map((c, i) => (
              <ChipView key={i} c={c} />
            ))}
          </div>
          {p.big && (
            <p className="big-line">
              <b>{p.big}</b> {p.text}
            </p>
          )}
          {p.trail && (
            <div className="trail">
              {p.trail.map((t, i) => (
                <Fragment key={i}>
                  {i > 0 && <span className="trail-arrow">→</span>}
                  <span className={i === p.trail!.length - 1 ? 'badge-dark' : 'trail-item'}>{t}</span>
                </Fragment>
              ))}
            </div>
          )}
        </>
      )}
      {p.type === 'bars' && (
        <>
          {p.sub && <p className="side-sub">{p.sub}</p>}
          <div className="bars">
            {p.bars.map((b, i) => (
              <div key={i} className="bar-row">
                <span>
                  <b>{b.label}</b> {b.suffix}
                </span>
                <div className="bar">
                  <i style={{ width: `${Math.max(3, b.frac * 100)}%` }} />
                </div>
                <b className="bar-value">{b.value}</b>
              </div>
            ))}
          </div>
        </>
      )}
      {p.type === 'table' && (
        <table className="mem-table">
          <thead>
            <tr>
              {p.cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.rows.map((row, i) => (
              <tr key={i} className={row.dim ? 'is-dim' : ''}>
                {row.cells.map((c, j) => (
                  <td key={j} className={row.hot?.includes(j) ? 'is-hot' : ''}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

const KW = /\b(if|else|return|for|each|while|in|error|and|or|not|until|break|repeat)\b/g;

function codeLine(line: string): ReactNode {
  const ci = line.indexOf('//');
  const main = ci >= 0 ? line.slice(0, ci) : line;
  const comment = ci >= 0 ? line.slice(ci) : '';
  const isHead = /^\S.*:\s*$/.test(main);
  const parts = main.split(KW);
  return (
    <>
      <span className={isHead ? 'code-head' : undefined}>{parts.map((p, i) => (i % 2 === 1 ? <span key={i} className="code-kw">{p}</span> : p))}</span>
      {comment && <span className="code-comment">{comment}</span>}
    </>
  );
}

function Pseudocode({ code, lines }: { code: string[]; lines?: number[] }) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const first = ref.current?.querySelector<HTMLElement>('.is-hl');
    const host = ref.current;
    if (first && host) host.scrollTo({ top: Math.max(0, first.offsetTop - host.clientHeight / 3), behavior: 'smooth' });
  }, [lines]);
  const hl = new Set(lines ?? []);
  return (
    <section className="card code-card">
      <div className="side-head">
        <ListOrdered size={22} className="side-icon" />
        <h3>Pseudocode</h3>
      </div>
      <ol ref={ref} className={`code${hl.size ? ' has-hl' : ''}`}>
        {code.map((line, i) => (
          <li key={i} className={hl.has(i + 1) ? 'is-hl' : ''}>
            <span className="code-n">{i + 1}</span>
            <code>{codeLine(line)}</code>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Stepper({ steps, index, onPick }: { steps: Step[]; index: number; onPick: (i: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 4);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener('resize', check);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [steps]);

  useEffect(() => {
    const el = track.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  return (
    <div className="card stepper">
      <div className="stepper-head">
        <span className="eyebrow">Lesson Steps</span>
        <span className="stepper-keys">
          <kbd>←</kbd> <kbd>→</kbd> <span className="stepper-keys-text">to navigate</span>
          <b>
            Step {index + 1} of {steps.length}
          </b>
        </span>
      </div>
      <div className="stepper-body">
        <button
          className={`stepper-nav${overflow ? ' has-overflow' : ''}`}
          onClick={() => onPick(Math.max(0, index - 1))}
          aria-label="Previous step"
          disabled={index === 0}
          title="Previous step"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="stepper-track" ref={track} tabIndex={0} role="region" aria-label="Step timeline">
          {steps.map((s, i) => (
            <button
              key={i}
              className={`stepper-step${i === index ? ' is-current' : ''}${i < index ? ' is-past' : ''}`}
              onClick={() => onPick(i)}
              aria-current={i === index ? 'step' : undefined}
              title={`Step ${i + 1}: ${s.title}`}
            >
              <span className="stepper-dot">{i + 1}</span>
              <span className="stepper-label">{s.title}</span>
            </button>
          ))}
        </div>
        <button
          className={`stepper-nav${overflow ? ' has-overflow' : ''}`}
          onClick={() => onPick(Math.min(steps.length - 1, index + 1))}
          aria-label="Next step"
          disabled={index === steps.length - 1}
          title="Next step"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ---------- the lesson page ---------- */

interface Props {
  lessonRef: LessonRef;
  lesson?: Lesson;
  onOpen: (id: string) => void;
  onFinish: (id: string) => void;
  onStepChange?: (stepIndex: number, totalSteps: number) => void;
  initialStep?: number;
}

export function LessonPage({ lessonRef, lesson, onOpen, onFinish, onStepChange, initialStep = 0 }: Props) {
  const steps = lesson?.steps ?? placeholderSteps(lessonRef);
  const [index, setIndex] = useState(() => Math.min(initialStep, steps.length - 1));

  // Sync index if initialStep changes from external navigation
  useEffect(() => {
    setIndex(Math.min(initialStep, steps.length - 1));
  }, [initialStep, steps.length]);

  // Keep the step in the address bar (#/lesson/3) without adding history entries.
  useEffect(() => {
    const hash = `#/${lessonRef.id}${index > 0 ? `/${index + 1}` : ''}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }, [lessonRef.id, index]);

  // Record step changes for persistent progress
  useEffect(() => {
    if (lesson) {
      onStepChange?.(index, steps.length);
    }
  }, [lesson, index, steps.length, onStepChange]);

  const step = steps[Math.min(index, steps.length - 1)];
  const flatIndex = allLessons.findIndex((l) => l.id === lessonRef.id);
  const nextLesson = allLessons[flatIndex + 1];
  const isLast = index === steps.length - 1;

  useEffect(() => {
    if (lesson && isLast) onFinish(lessonRef.id);
  }, [lesson, isLast, lessonRef.id, onFinish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea')) return;
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(steps.length - 1, i + 1));
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [steps.length]);

  const next = () => {
    if (!isLast) setIndex(index + 1);
    else if (nextLesson) onOpen(nextLesson.id);
  };
  const nextLabel = !isLast ? `Next: ${steps[index + 1].title}` : nextLesson ? `Next lesson: ${nextLesson.title}` : 'Course complete';
  const note = step.note ? NOTE[step.note.kind] : null;

  return (
    <>
      <main className="main">
        <section className="card lesson-card">
          <div className="lesson-head">
            <h1>{lessonRef.title}</h1>
            <div className="lesson-meta">
              <div>
                <div className="lesson-chapter">
                  <span className="badge-dark">{pad2(lessonRef.chapterIndex + 1)}</span>
                  {lessonRef.chapter.title}
                </div>
                <div className="eyebrow">
                  Lesson {lessonRef.indexInChapter + 1} of {lessonRef.chapter.lessons.length}
                </div>
              </div>
              <ChapterIcon count={lessonRef.chapter.lessons.length} index={lessonRef.indexInChapter} />
            </div>
          </div>
          <div className="stage">
            <Scene key={lessonRef.id} objects={step.scene} label={`${lessonRef.title}: ${step.title}`} />
          </div>
        </section>
        <Stepper steps={steps} index={index} onPick={setIndex} />
      </main>

      <aside className="aside">
        <section className="card step-card" aria-live="polite">
          <div className="step-top">
            <span className="eyebrow">
              Step {index + 1} / {steps.length}
            </span>
            <span className="step-tag">{step.tag}</span>
          </div>
          <h2>{step.title}</h2>
          <div className="step-body">
            {step.body.map((p, i) => (
              <p key={i}>{rich(p)}</p>
            ))}
          </div>
          {step.note && note && (
            <div className="note">
              <span className="note-icon">
                <note.Icon size={18} />
              </span>
              <div>
                <div className="note-label">{step.note.label ?? note.label}</div>
                <div>{rich(step.note.text)}</div>
              </div>
            </div>
          )}
          <div className="step-actions">
            <button className="btn btn-ghost" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
              <ArrowLeft size={18} /> Back
            </button>
            <button className="btn btn-coral" onClick={next} disabled={isLast && !nextLesson}>
              <span>{nextLabel}</span> <ArrowRight size={18} />
            </button>
          </div>
        </section>
        {lesson && <Pseudocode code={lesson.code} lines={step.lines} />}
        {step.panels?.map((p, i) => (
          <PanelView key={lessonRef.id + i + p.title} p={p} />
        ))}
      </aside>
    </>
  );
}

/** Lessons that are listed in the course but not written yet still get a page. */
function placeholderSteps(ref: LessonRef): Step[] {
  const sceneObjs: SceneObj[] = [
    slab('pad', 0, 0, 6, 3, 0.7, { side: 'IN PREPARATION', tray: true }),
    box('a', 1, 1, 0.7, '?', 'soft'),
    box('b', 2.5, 1, 0.7, undefined, 'plain', { h: 0.6 }),
    box('c', 4, 1, 0.7, undefined, 'plain', { h: 1.4 }),
    tag('t', [4.5, 1.5, 2.1], ref.title, { dy: -40, tone: 'coral' }),
  ];
  return [
    {
      title: 'Coming soon',
      tag: 'Draft',
      body: [`The walkthrough for **${ref.title}** has not been written yet in this rebuild.`, 'The lessons from the demo are complete: Stacks, Divide & Conquer, Binary Search, Quick Sort, Singly Linked Lists, Breadth-First Search, Huffman Coding and P vs NP.'],
      note: { kind: 'aside', text: 'Each lesson is a plain data file in src/lessons/. Adding one is mostly writing the steps.' },
      scene: sceneObjs,
    },
  ];
}
