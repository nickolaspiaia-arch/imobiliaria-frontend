/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        principal: '#0B132B',
        secundaria: '#FFFFE4',
      }
    },
  },
  plugins: [],
}
