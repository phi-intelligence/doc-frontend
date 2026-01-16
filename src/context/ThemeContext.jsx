import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEME_STORAGE_KEY, DEFAULT_THEME } from '../config/theme';

const ThemeContext = createContext();

/**
 * Theme provider component
 * Manages dark/light theme state and persistence
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // Get theme from localStorage or use default
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored || DEFAULT_THEME;
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    // Apply theme class to html element
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Persist theme preference
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

