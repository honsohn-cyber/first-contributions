/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#0b0c10',
        panel: '#14161d',
        accent: {
          DEFAULT: '#7c5cff',
          light: '#a78bfa',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,92,255,0.35), 0 8px 40px -8px rgba(124,92,255,0.45)',
      },
    },
  },
  plugins: [],
};
