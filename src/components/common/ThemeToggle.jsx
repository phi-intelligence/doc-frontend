import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Theme toggle button component
 * Switches between light and dark themes
 */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-light-text-secondary hover:text-light-text hover:bg-light-sidebar transition-all duration-200 dark:text-dark-text-secondary dark:hover:text-dark-text dark:hover:bg-dark-sidebar"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;

