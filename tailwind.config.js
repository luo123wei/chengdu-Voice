/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 黑白灰极简工作室风
        primary: '#000000',
        'primary-dark': '#1A1A1A',
        secondary: '#1A1A1A',
        'secondary-dark': '#000000',
        accent: '#B54A32',        // 唯一克制点缀:赭红
        cream: '#FAFAFA',         // 浅底近白
        ink: '#111111',
        gold: '#111111',
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
      },
    },
  },
  plugins: [],
}
