/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Main backgrounds - warm cream/off-white
                'light-bg': '#FAF9F6',
                'light-surface': '#FFFFFF',
                'light-sidebar': '#F5F3EE',

                // Borders - warm gray
                'light-border': '#E8E4DD',
                'light-border-hover': '#D4CFC5',

                // Text colors
                'light-text': '#1A1A1A',
                'light-text-secondary': '#6B6B6B',
                'light-text-muted': '#8B8680',

                // Terminal/code backgrounds
                'terminal-light': '#FAFAF8',
                'code-dark': '#1E1E1E',

                // Brand accent - warm brown/gold
                'brand-accent': {
                    DEFAULT: '#886C4A',
                    50: '#FAF7F3',
                    100: '#F3EDE5',
                    200: '#E5D9C9',
                    300: '#D4C4A8',
                    400: '#B8A07A',
                    500: '#886C4A',
                    600: '#755C3D',
                    700: '#5C4830',
                    800: '#433524',
                    900: '#2A2118',
                },

                // Status colors
                'status-success': '#27C93F',
                'status-error': '#FF5F56',
                'status-warning': '#FFBD2E',

                // Legacy aliases
                'claude-bg': '#FAF9F6',
                'claude-accent': '#886C4A',
                'brand-bg': '#FAF9F6',
                'brand-surface': '#FFFFFF',
                'claude-text': '#1A1A1A',
                'claude-msg-user': '#FAF9F6',
                'claude-msg-bot': '#FAF9F6',
            },
            fontFamily: {
                sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                serif: ['"Playfair Display"', 'Georgia', 'serif'],
                display: ['"Inter"', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
            },
            letterSpacing: {
                tighter: '-0.02em',
                tight: '-0.01em',
                normal: '0em',
                wide: '0.01em',
                wider: '0.02em',
                widest: '0.04em',
            },
            lineHeight: {
                tighter: '1.1',
                tight: '1.2',
                snug: '1.3',
                normal: '1.4',
                relaxed: '1.5',
                loose: '1.6',
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
                'medium': '0 4px 12px rgba(0, 0, 0, 0.06)',
            }
        },
    },
    plugins: [],
}
