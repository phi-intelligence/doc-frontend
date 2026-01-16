/**
 * Theme configuration
 * Defines color schemes and theme-related constants
 */

export const themeConfig = {
  light: {
    bg: {
      primary: '#FAF9F6',
      surface: '#FFFFFF',
      sidebar: '#F5F3EE',
    },
    border: {
      default: '#E8E4DD',
      hover: '#D4CFC5',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B6B6B',
      muted: '#8B8680',
    },
    brand: {
      accent: '#06b6d4',
      accent50: '#ecfeff',
      accent100: '#cffafe',
      accent200: '#a5f3fc',
      accent300: '#67e8f9',
      accent400: '#22d3ee',
      accent500: '#06b6d4',
      accent600: '#0891b2',
      accent700: '#0e7490',
      accent800: '#155e75',
      accent900: '#164e63',
    },
  },
  dark: {
    bg: {
      primary: '#0f0f0f',
      surface: '#1a1a1a',
      sidebar: '#1f1f1f',
    },
    border: {
      default: '#2a2a2a',
      hover: '#3a3a3a',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#a0a0a0',
      muted: '#808080',
    },
    brand: {
      accent: '#22d3ee',
      accent50: '#164e63',
      accent100: '#155e75',
      accent200: '#0e7490',
      accent300: '#0891b2',
      accent400: '#06b6d4',
      accent500: '#22d3ee',
      accent600: '#67e8f9',
      accent700: '#a5f3fc',
      accent800: '#cffafe',
      accent900: '#ecfeff',
    },
  },
};

export const THEME_STORAGE_KEY = 'docflies-theme';
export const DEFAULT_THEME = 'light';

