/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          500: '#667eea',
          600: '#5568d3',
        },
        secondary: {
          500: '#764ba2',
        }
      }
    },
  },
  plugins: [],
}