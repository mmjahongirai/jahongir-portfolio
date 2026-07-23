import { useTheme } from '../../lib/theme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-magnetic
      data-cursor-hover
      className="relative flex items-center w-[52px] h-[28px] rounded-pill bg-surface-secondary border border-border p-0.5 transition-all duration-300 hover:border-border-hover"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-accent-yellow shadow-apple-sm flex items-center justify-center transition-transform duration-300 ease-out ${
          isDark ? 'translate-x-0' : 'translate-x-[22px]'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-black" />
        ) : (
          <Sun className="w-3 h-3 text-black" />
        )}
      </span>
      <span className="sr-only">{isDark ? 'Dark mode' : 'Light mode'}</span>
    </button>
  );
}
