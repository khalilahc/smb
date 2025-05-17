/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  safelist: [
    'grid-cols-1',
    'sm:grid-cols-2',
    'sm:grid-cols-2 md:grid-cols-3',
    'sm:grid-cols-2 md:grid-cols-4'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
