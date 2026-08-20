'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-28 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur">
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Light mode"
        aria-label="Light mode"
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition ${
          theme === 'light'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
        }`}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Dark mode"
        aria-label="Dark mode"
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition ${
          theme === 'dark'
            ? 'bg-slate-800 text-blue-400 shadow-sm dark:bg-slate-800 dark:text-blue-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
        }`}
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        title="System preference"
        aria-label="System preference"
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition ${
          theme === 'system'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
        }`}
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
