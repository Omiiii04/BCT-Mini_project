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
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          400: '#38bdf8',
          500: '#22d3ee',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'dig': 'dig 0.7s ease-in-out infinite',
      },
      keyframes: {
        dig: {
          '50%': { transform: 'rotate(-18deg) translateY(2px)' },
        },
      },
    },
  },
  plugins: [],
}
