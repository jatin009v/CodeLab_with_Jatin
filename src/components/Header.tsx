import { BarChart3, BookOpen, ChevronDown, Code2, FileText, Globe, Menu, Moon, Search, Sun, Trophy, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { allLessons, pad2 } from '../course';
import { lessons } from '../lessons';

export type View = 'learn' | 'practice' | 'cheatsheets' | 'challenges' | 'progress';

const NAV: { id: View; label: string; Icon: typeof BookOpen }[] = [
  { id: 'learn', label: 'Learn', Icon: BookOpen },
  { id: 'practice', label: 'Practice', Icon: Code2 },
  { id: 'cheatsheets', label: 'Cheatsheets', Icon: FileText },
  { id: 'challenges', label: 'Challenges', Icon: Trophy },
  { id: 'progress', label: 'Progress', Icon: BarChart3 },
];

export function Logo() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="logo-tile" />
      <path d="M16 7 25 11.5 16 16 7 11.5Z" className="logo-top" />
      <path d="M7 16l9 4.5 9-4.5M7 20.5l9 4.5 9-4.5" className="logo-line" />
    </svg>
  );
}

interface Props {
  view: View;
  onView: (v: View) => void;
  onOpen: (id: string) => void;
  theme: 'light' | 'dark';
  onTheme: () => void;
}

export function Header({ view, onView, onOpen, theme, onTheme }: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s ? allLessons.filter((l) => l.title.toLowerCase().includes(s) || l.chapter.title.toLowerCase().includes(s)) : allLessons.filter((l) => lessons[l.id]);
    return list.slice(0, 8);
  }, [q]);

  const pick = (id: string) => {
    onOpen(id);
    onView('learn');
    setOpen(false);
    setQ('');
    setMobileMenuOpen(false);
    input.current?.blur();
  };

  const selectView = (v: View) => {
    onView(v);
    setMobileMenuOpen(false);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <a className="brand" href="#/stacks" aria-label="CodeLab home">
          <Logo />
          <span className="brand-name">
            Code<mark>Lab</mark>
          </span>
          <span className="brand-tag">by Jatin</span>
        </a>

        <nav className="nav desktop-nav" aria-label="Sections">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} className={`nav-item${view === id ? ' is-on' : ''}`} onClick={() => selectView(id)} aria-current={view === id ? 'page' : undefined}>
              <Icon size={17} strokeWidth={2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="topbar-tools">
        <div className="search">
          <Search size={16} className="search-icon" />
          <input
            ref={input}
            value={q}
            placeholder="Search lessons... (⌘K)"
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') setActive((a) => Math.min(results.length - 1, a + 1));
              else if (e.key === 'ArrowUp') setActive((a) => Math.max(0, a - 1));
              else if (e.key === 'Enter' && results[active]) pick(results[active].id);
              else if (e.key === 'Escape') input.current?.blur();
              e.stopPropagation();
            }}
            aria-label="Search lessons"
          />
          <kbd className="search-kbd">⌘K</kbd>
          {open && (
            <ul className="search-results" role="listbox">
              {results.length === 0 && <li className="search-empty">Nothing matches “{q}”.</li>}
              {results.map((r, i) => (
                <li key={r.id} role="option" aria-selected={i === active} className={i === active ? 'is-active' : ''} onMouseDown={() => pick(r.id)} onMouseEnter={() => setActive(i)}>
                  <span className="search-title">{r.title}</span>
                  <span className="search-meta">
                    {pad2(r.chapterIndex + 1)} · {r.chapter.title}
                    {lessons[r.id] ? '' : ' · soon'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="tool-btn lang" title="Language: English" aria-label="Language: English">
          <Globe size={16} /> <span className="lang-text">EN</span> <ChevronDown size={14} />
        </button>

        <button className="tool-btn icon theme-btn" onClick={onTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <a className="credit" href="https://www.linkedin.com/in/jatingupta09/" target="_blank" rel="noopener noreferrer" aria-label="Jatin Gupta's LinkedIn profile">
          <span className="credit-x" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </span>
          <span className="credit-text">
            <span className="credit-label">Developed by</span>
            <mark>Jatin Gupta</mark>
          </span>
        </a>

        <button
          className="tool-btn icon menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-card" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="eyebrow">Navigation</span>
              <button className="tool-btn icon" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X size={16} />
              </button>
            </div>
            <nav className="mobile-nav" aria-label="Mobile sections">
              {NAV.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={`mobile-nav-item${view === id ? ' is-on' : ''}`}
                  onClick={() => selectView(id)}
                  aria-current={view === id ? 'page' : undefined}
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
            <div className="mobile-menu-footer">
              <a
                className="mobile-credit"
                href="https://www.linkedin.com/in/jatingupta09/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="credit-x" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </span>
                <div className="credit-text">
                  <span className="credit-label">Developed by</span>
                  <mark>Jatin Gupta</mark>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
