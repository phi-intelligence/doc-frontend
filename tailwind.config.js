/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Main backgrounds - Cool neutral greys
                'light-bg': '#D3D3D2',
                'light-surface': '#F8F9FA',
                'light-sidebar': '#C8C8C7',

                // Borders - Defined neutral greys
                'light-border': '#B0B0B0',
                'light-border-hover': '#9A9A9A',

                // Text colors - Neutral darks
                'light-text': '#1A1A1B',
                'light-text-secondary': '#454546',
                'light-text-muted': '#717172',

                // Terminal/code backgrounds
                'terminal-light': '#E8E8E7',
                'code-dark': '#1E1E1E',

                // Brand accent - Aqua blue selection palette
                'brand-accent': {
                    DEFAULT: '#427CCB',
                    50: '#F0F4FA',
                    100: '#D6E2F3',
                    200: '#B8CDEB',
                    300: '#9AB8E3',
                    400: '#7FA2D9',
                    500: '#427CCB',
                    600: '#195DB0',
                    700: '#144A8C',
                    800: '#0E3768',
                    900: '#092444',
                },

                // Status colors
                'status-success': '#27C93F',
                'status-error': '#FF5F56',
                'status-warning': '#FFBD2E',

                // Legacy aliases updated to neutral
                'claude-bg': '#F8F9FA',
                'claude-accent': '#427CCB',
                'brand-bg': '#F8F9FA',
                'brand-surface': '#FFFFFF',
                'claude-text': '#1A1A1B',
                'claude-msg-user': '#F0F4FA',
                'claude-msg-bot': '#F8F9FA',
            },
            fontFamily: {
                sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                serif: ['"Playfair Display"', 'Georgia', 'serif'],
                display: ['"Inter"', 'system-ui', 'sans-serif'],
                mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'Fira Code', 'monospace'],
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
