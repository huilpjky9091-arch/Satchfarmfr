/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#fdf6e7',
          100: '#f8e6c1',
          200: '#efc986',
          300: '#e2a74c',
          400: '#c98229',
          500: '#a3611d',
          600: '#7f4717',
          700: '#5e3212',
          800: '#42220d',
          900: '#2b1608',
        },
        meadow: {
          400: '#6bb359',
          500: '#4d923d',
          600: '#37702c',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['"Fredoka"', '"Noto Sans Thai"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pixel: '0 4px 0 0 rgba(43, 22, 8, 0.85)',
        'pixel-sm': '0 2px 0 0 rgba(43, 22, 8, 0.85)',
      },
    },
  },
  plugins: [],
};
