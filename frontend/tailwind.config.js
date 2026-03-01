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
        main_text: '#F6F6F6',
        main_background: '#212121',
        primary: '#6D9886', // 6D9886
        secondary: '#D9CAB3', 
      }

      
    },
  },
  plugins: [],
}

