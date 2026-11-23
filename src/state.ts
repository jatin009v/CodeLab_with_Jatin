import { useCallback, useEffect, useState } from 'react';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode: progress just isn't kept */
  }
};

/** The lesson id in the URL hash: #/stacks */
export function useRoute(defaultId: string): [string, (id: string) => void] {
  const get = () => decodeURIComponent(location.hash.replace(/^#\/?/, '')) || defaultId;
  const [id, setId] = useState(get);
  useEffect(() => {
    const on = () => setId(get());
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const go = useCallback((next: string) => {
    location.hash = '/' + next;
  }, []);
  return [id, go];
}

export function useTheme(): ['light' | 'dark', () => void] {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('algolab:theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

/** Lessons the learner has walked to the end of. */
export function useProgress(): [Set<string>, (id: string) => void] {
  const [done, setDone] = useState<Set<string>>(() => new Set(read<string[]>('algolab:done', [])));
  const mark = useCallback((id: string) => {
    setDone((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      write('algolab:done', [...next]);
      return next;
    });
  }, []);
  return [done, mark];
}
