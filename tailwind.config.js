/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C59B6D',
        secondary: '#2C3E50',
        accent: '#E74C3C',
        cream: '#FDF5E6',
        ink: '#2C2C2C',
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
      },
    },
  },
  plugins: [],
}
