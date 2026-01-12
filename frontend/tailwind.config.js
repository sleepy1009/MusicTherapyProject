/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Font mặc định cho toàn web
        'out-text': ['Roboto Slab', 'serif'], // Font riêng cho Logo/Tiêu đề
      },
      colors: {
        primary: '#4F46E5', 
        secondary: '#10B981', 
      }
    },
  },
  plugins: [],
}