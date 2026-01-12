/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a5b9fc',
          400: '#8194f8',
          500: '#6370f1',
          600: '#4f51e5',
          700: '#4341ca',
          800: '#1a1a2e',
          900: '#16162a',
          950: '#0f0f1a',
        },
        secondary: {
          50: '#fdf8f3',
          100: '#faeee3',
          200: '#f4dcc6',
          300: '#ecc49f',
          400: '#e2a576',
          500: '#d98c55',
          600: '#cb7549',
          700: '#a95d3e',
          800: '#884c38',
          900: '#6e4030',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
