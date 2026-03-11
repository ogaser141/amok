'use client';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      className="p-2 rounded-lg transition-colors"
      style={{ color: 'var(--text3)', background: 'transparent' }}
      onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
      onMouseOut={e => (e.currentTarget.style.color = 'var(--text3)')}>
      {theme === 'dark'
        ? <Sun className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  );
}
