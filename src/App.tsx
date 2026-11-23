import { useState } from 'react';
import { allLessons, course, findLesson, pad2 } from './course';
import { Header, type View } from './components/Header';
import { LessonPage } from './components/Lesson';
import { Sidebar } from './components/Sidebar';
import { lessons } from './lessons';
import { useProgress, useRoute, useTheme } from './state';

function ProgressView({ done, onOpen }: { done: Set<string>; onOpen: (id: string) => void }) {
  return (
    <main className="main main--wide">
      <section className="card page-card">
        <h1>Progress</h1>
        <p className="page-lead">
          {done.size} of {allLessons.length} lessons walked through to the end. Finishing the last step of a lesson ticks it off.
        </p>
        <div className="progress-grid">
          {course.map((ch, ci) => {
            const n = ch.lessons.filter((l) => done.has(l.id)).length;
            return (
              <div key={ch.title} className="progress-item">
                <div className="progress-item-head">
                  <span className="badge-dark">{pad2(ci + 1)}</span>
                  <b>{ch.title}</b>
                  <span className="chapter-count">
                    {n}/{ch.lessons.length}
                  </span>
                </div>
                <div className="bar">
                  <i style={{ width: `${(n / ch.lessons.length) * 100}%` }} />
                </div>
                <div className="progress-lessons">
                  {ch.lessons.map((l) => (
                    <button key={l.id} className={`chip-ui ${done.has(l.id) ? 'chip-ui--hot' : lessons[l.id] ? 'chip-ui--soft' : 'chip-ui--plain'}`} onClick={() => onOpen(l.id)}>
                      {l.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function SoonView({ title }: { title: string }) {
  return (
    <main className="main main--wide">
      <section className="card page-card">
        <h1>{title}</h1>
        <p className="page-lead">This section is not part of the rebuild yet. The Learn section and the Progress page work.</p>
      </section>
    </main>
  );
}

export default function App() {
  const [route, go] = useRoute('stacks');
  const [id, stepPart] = route.split('/');
  const initialStep = Math.max(0, (parseInt(stepPart ?? '1', 10) || 1) - 1);
  const [theme, toggleTheme] = useTheme();
  const [done, markDone] = useProgress();
  const [view, setView] = useState<View>('learn');
  const ref = findLesson(id) ?? findLesson('stacks')!;

  const open = (lessonId: string) => {
    go(lessonId);
    setView('learn');
  };

  return (
    <div className="app">
      <Header view={view} onView={setView} onOpen={open} theme={theme} onTheme={toggleTheme} />
      <div className={`layout${view === 'learn' ? '' : ' layout--page'}`}>
        <Sidebar current={ref.id} done={done} onOpen={open} />
        {view === 'learn' && <LessonPage key={ref.id} lessonRef={ref} lesson={lessons[ref.id]} initialStep={initialStep} onOpen={open} onFinish={markDone} />}
        {view === 'progress' && <ProgressView done={done} onOpen={open} />}
        {view !== 'learn' && view !== 'progress' && <SoonView title={view[0].toUpperCase() + view.slice(1)} />}
      </div>
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <strong>Made for Developers</strong>
            <span className="footer-tagline">"Turning logic into learning, one line of code at a time."</span>
          </div>
          <div className="footer-meta">
            <span>
              Developed by{' '}
              <a href="https://www.linkedin.com/in/jatingupta09/" target="_blank" rel="noopener noreferrer" className="footer-link">
                Jatin Gupta
              </a>
            </span>
            <span className="footer-sep">•</span>
            <span className="footer-attr">Inspired by @DilumSanjaya</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
