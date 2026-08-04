/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--c-ink)',
        subink: 'var(--c-subink)',
        base: 'var(--c-base)',
        panel: 'var(--c-panel)',
        line: 'var(--c-line)',
        ai: 'var(--c-ai)',
        aidim: 'var(--c-ai-dim)',
        go: 'var(--c-go)',
        warn: 'var(--c-warn)',
        danger: 'var(--c-danger)',
        focus: 'var(--c-focus)',
      },
      fontFamily: {
        ud: ['BIZ UDPGothic', 'BIZ UDGothic', 'Yu Gothic UI', 'Meiryo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
