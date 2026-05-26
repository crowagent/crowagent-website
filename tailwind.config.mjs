/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        ca: {
          bg: '#040E1A',
          surf: '#0A1F3A',
          teal: '#0CC9A8',
          cloud: '#E8F0FA',
          steel: '#B8CCE0',
        }
      }
    },
  },
  plugins: [],
}
