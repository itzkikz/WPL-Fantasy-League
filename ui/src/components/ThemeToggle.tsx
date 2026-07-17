import { Moon } from 'lucide-react';

export const ThemeToggle = () => {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-text-primary">
      <Moon className="w-3.5 h-3.5 text-primary" />
      <span>Dark Mode</span>
    </div>
  );
};
