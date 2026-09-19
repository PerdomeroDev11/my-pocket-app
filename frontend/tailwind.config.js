/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'black-russian': {
          50: '#f0f3fd',
          100: '#e3e9fc',
          200: '#ccd6f9',
          300: '#adbbf4',
          400: '#8c97ed',
          500: '#7075e4',
          600: '#5954d7',
          700: '#4c45bd',
          800: '#3e3a99',
          900: '#36357a',
          950: '#14132b',
        }
      }
    },
  },
  plugins: [],
}
