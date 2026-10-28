/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#111827',
          900: '#0b1120',
          925: '#070d19',
          950: '#030712',
        },
        apple: {
          blue: '#0071e3',
          hoverBlue: '#0077ED',
          cyan: '#00C7BE',
          purple: '#AF52DE',
          indigo: '#5856D6',
          green: '#30D158',
          orange: '#FF9F0A',
          red: '#FF453A',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'system-ui',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'apple-card': '0 4px 24px -1px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
        'apple-hover': '0 12px 36px -2px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.14) inset',
        'apple-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 1px 0 0 rgba(255, 255, 255, 0.1) inset',
        'apple-glow': '0 0 40px -10px rgba(34, 211, 238, 0.25)',
        'apple-glow-green': '0 0 40px -10px rgba(48, 209, 88, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
