/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'corporate-blue': '#003865',
        gold: '#C69C6D',
        'gold-light': '#E5C598',
      },
    },
  },
  plugins: [],
}
