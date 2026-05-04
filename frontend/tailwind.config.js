/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'], // Base font, Inter, Darker Grotesque, Roboto Slab, Be Vietnam Pro
        'out-text': ['Roboto Slab', 'serif'], // Font highlight
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

