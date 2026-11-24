import { useCallback, useEffect, useState } from 'react';

export type LessonProgress = {
  lessonId: string;
  lastStep: number;
  totalSteps: number;
  completed: boolean;
  updatedAt: number;
};

export type LearningProgress = {
  version: 1;
  lastVisitedLessonId: string | null;
  lastVisitedStep: number;
  lessons: Record<string, LessonProgress>;
};

const STORAGE_KEY = 'codelab:progress';
const LEGACY_DONE_KEY = 'algolab:done';
const THEME_KEY = 'codelab:theme';
const LEGACY_THEME_KEY = 'algolab:theme';

const defaultProgress: LearningProgress = {
  version: 1,
  lastVisitedLessonId: null,
  lastVisitedStep: 0,
  lessons: {},
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or storage quota */
  }
}

/** Initialise and migrate progress safely */
function getInitialProgress(): LearningProgress {
  const saved = readStorage<LearningProgress | null>(STORAGE_KEY, null);
  if (saved && saved.version === 1 && typeof saved.lessons === 'object') {
    return saved;
  }

  // Migrate legacy done lessons if present
  const legacyDone = readStorage<string[]>(LEGACY_DONE_KEY, []);
  const initial = { ...defaultProgress, lessons: { ...defaultProgress.lessons } };
  const now = Date.now();
  legacyDone.forEach((id) => {
    initial.lessons[id] = {
      lessonId: id,
      lastStep: 0,
      totalSteps: 1,
      completed: true,
      updatedAt: now,
    };
  });
  return initial;
}

/** The lesson id in the URL hash: #/big-o or #/binary-search/4 */
export function useRoute(defaultId = 'big-o'): [string, (path: string) => void] {
  const get = () => {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    return h || defaultId;
  };
  const [route, setRoute] = useState(get);

  useEffect(() => {
    // If user opens root or empty hash, ensure address bar displays default #/big-o
    if (!location.hash || location.hash === '#' || location.hash === '#/') {
      history.replaceState(null, '', '#/' + defaultId);
      setRoute(defaultId);
    }
  }, [defaultId]);

  useEffect(() => {
    const on = () => setRoute(get());
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultId]);

  const go = useCallback((next: string) => {
    location.hash = '/' + next.replace(/^\//, '');
  }, []);

  return [route, go];
}

export function useTheme(): ['light' | 'dark', () => void] {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      /* ignore */
    }
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
      localStorage.setItem(LEGACY_THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

/** Persistent learning progress hook */
export function useProgress(): {
  progress: LearningProgress;
  done: Set<string>;
  markDone: (id: string, totalSteps?: number) => void;
  recordStep: (id: string, stepIndex: number, totalSteps: number) => void;
  lastVisited: { lessonId: string; step: number } | null;
} {
  const [progress, setProgress] = useState<LearningProgress>(getInitialProgress);

  const markDone = useCallback(
    (id: string, totalSteps = 1) => {
      setProgress((prev) => {
        const existing = prev.lessons[id];
        if (existing?.completed) return prev;
        const updatedLesson: LessonProgress = {
          lessonId: id,
          lastStep: existing ? existing.lastStep : totalSteps - 1,
          totalSteps: Math.max(totalSteps, existing?.totalSteps ?? 1),
          completed: true,
          updatedAt: Date.now(),
        };
        const next: LearningProgress = {
          ...prev,
          lastVisitedLessonId: id,
          lastVisitedStep: updatedLesson.lastStep,
          lessons: {
            ...prev.lessons,
            [id]: updatedLesson,
          },
        };
        writeStorage(STORAGE_KEY, next);
        const doneList = Object.values(next.lessons)
          .filter((l) => l.completed)
          .map((l) => l.lessonId);
        writeStorage(LEGACY_DONE_KEY, doneList);
        return next;
      });
    },
    [],
  );

  const recordStep = useCallback(
    (id: string, stepIndex: number, totalSteps: number) => {
      setProgress((prev) => {
        const existing = prev.lessons[id];
        // If unchanged, do not trigger re-render
        if (existing && existing.lastStep === stepIndex && prev.lastVisitedLessonId === id) {
          return prev;
        }
        const updatedLesson: LessonProgress = {
          lessonId: id,
          lastStep: stepIndex,
          totalSteps,
          completed: existing?.completed ?? false,
          updatedAt: Date.now(),
        };
        const next: LearningProgress = {
          ...prev,
          lastVisitedLessonId: id,
          lastVisitedStep: stepIndex,
          lessons: {
            ...prev.lessons,
            [id]: updatedLesson,
          },
        };
        writeStorage(STORAGE_KEY, next);
        return next;
      });
    },
    [],
  );

  const done = new Set(
    Object.values(progress.lessons)
      .filter((l) => l.completed)
      .map((l) => l.lessonId),
  );

  const lastVisited = progress.lastVisitedLessonId
    ? {
        lessonId: progress.lastVisitedLessonId,
        step: progress.lessons[progress.lastVisitedLessonId]?.lastStep ?? progress.lastVisitedStep ?? 0,
      }
    : null;

  return { progress, done, markDone, recordStep, lastVisited };
}
