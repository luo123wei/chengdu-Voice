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
        'primary-dark': '#A68455',
        secondary: '#2C3E50',
        'secondary-dark': '#1A252F',
        accent: '#E74C3C',
        cream: '#FDF5E6',
        ink: '#2C2C2C',
        gold: '#D4AF37',
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
      },
    },
  },
  plugins: [],
}
