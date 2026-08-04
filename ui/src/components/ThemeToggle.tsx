import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 p-1 transition-colors hover:bg-gray-200 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
    >
      <div className="flex items-center gap-1.5 px-2 py-1">
        <Sun className={`w-4 h-4 transition-colors ${!isDark ? 'text-amber-500 font-bold' : 'text-gray-400 dark:text-gray-500'}`} />
        <Moon className={`w-4 h-4 transition-colors ${isDark ? 'text-purple-400 font-bold' : 'text-gray-400 dark:text-gray-500'}`} />
      </div>

      <div
        className={`absolute h-7 w-7 rounded-full bg-white dark:bg-purple-600 shadow-md transition-transform duration-200 flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-white" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
    </button>
  );
};

