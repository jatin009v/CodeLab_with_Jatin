import { ChevronDown, ChevronRight, ChevronUp, FileCheck2, FileText, Folder, FolderOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { allLessons, course, findLesson, pad2 } from '../course';

interface Props {
  current: string;
  done: Set<string>;
  onOpen: (id: string) => void;
  lastVisited?: { lessonId: string; step: number } | null;
}

export function Sidebar({ current, done, onOpen, lastVisited }: Props) {
  const currentChapter = findLesson(current)?.chapterIndex ?? 0;
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set([currentChapter]));
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Opening a lesson from elsewhere (search, "next lesson") unfolds its chapter.
  useEffect(() => {
    setOpenSet((s) => (s.has(currentChapter) ? s : new Set(s).add(currentChapter)));
  }, [currentChapter]);

  const toggle = (i: number) =>
    setOpenSet((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  const total = allLessons.length;
  const currentLessonObj = findLesson(current);
  const lastVisitedRef = lastVisited && lastVisited.lessonId !== current ? findLesson(lastVisited.lessonId) : null;

  const handleLessonClick = (id: string) => {
    onOpen(id);
    // On mobile, automatically collapse tree after selecting so user sees the lesson
    if (window.innerWidth <= 768) {
      setMobileExpanded(false);
    }
  };

  return (
    <aside className={`sidebar card${mobileExpanded ? ' is-mobile-expanded' : ''}`} aria-label="Course">
      <div className="sidebar-head">
        <FolderOpen size={18} className="sidebar-head-icon" fill="currentColor" />
        <span className="sidebar-title">Course Outline</span>
        <span className="sidebar-count">{total} lessons</span>
        <button
          className="sidebar-mobile-toggle"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          aria-expanded={mobileExpanded}
          aria-label={mobileExpanded ? 'Collapse course sidebar' : 'Expand course sidebar'}
        >
          <span className="sidebar-mobile-label">
            {mobileExpanded ? 'Hide' : currentLessonObj ? currentLessonObj.title : 'Browse'}
          </span>
          {mobileExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="sidebar-content">
        {lastVisitedRef && (
          <div className="sidebar-continue-wrap">
            <button
              className="sidebar-continue-btn"
              onClick={() => handleLessonClick(lastVisited!.lessonId + (lastVisited!.step > 0 ? `/${lastVisited!.step + 1}` : ''))}
              title={`Continue ${lastVisitedRef.title} at Step ${lastVisited!.step + 1}`}
            >
              <span className="continue-sparkle" aria-hidden="true">▶</span>
              <span className="continue-meta">
                <span className="continue-label">Continue Learning</span>
                <b className="continue-title">{lastVisitedRef.title}</b>
              </span>
              <span className="continue-step">Step {lastVisited!.step + 1} →</span>
            </button>
          </div>
        )}

        <div className="tree">
          {course.map((ch, ci) => {
            const isOpen = openSet.has(ci);
            const doneCount = ch.lessons.filter((l) => done.has(l.id)).length;
            const isCurrent = ci === currentChapter;
            return (
              <div key={ch.title} className={`chapter${isOpen ? ' is-open' : ''}`}>
                <button className="chapter-row" onClick={() => toggle(ci)} aria-expanded={isOpen}>
                  <ChevronRight size={15} className="chev" />
                  {isCurrent ? <Folder size={17} className="folder folder--on" fill="currentColor" /> : <Folder size={17} className="folder" />}
                  <span className="chapter-name">
                    {pad2(ci + 1)}. {ch.title}
                  </span>
                  <span className="chapter-count">
                    {doneCount}/{ch.lessons.length}
                  </span>
                </button>
                <div className="chapter-lessons" role="list">
                  <div className="chapter-lessons-inner">
                    {ch.lessons.map((l) => (
                      <button
                        key={l.id}
                        role="listitem"
                        className={`lesson-row${l.id === current ? ' is-current' : ''}${done.has(l.id) ? ' is-done' : ''}`}
                        onClick={() => handleLessonClick(l.id)}
                        aria-current={l.id === current ? 'page' : undefined}
                      >
                        {done.has(l.id) ? <FileCheck2 size={14} className="lesson-check-icon" /> : <FileText size={14} className="lesson-text-icon" />}
                        <span className="lesson-row-title">{l.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sidebar-progress">
          <span className="sidebar-progress-label">Progress</span>
          <div className="bar">
            <i style={{ width: `${(done.size / total) * 100}%` }} />
          </div>
          <span className="sidebar-progress-num">
            {done.size}/{total}
          </span>
        </div>
      </div>
    </aside>
  );
}
