/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kuboo: {
          dark: '#212121',
          surface: '#303030',
          bg: '#1e1e1e',
          oledBg: '#000000',
          oledSurface: '#121212',
          accent: '#FF5252',
          accentLight: '#FF7D7D',
          border: '#3c3c3c',
          textMuted: '#9e9e9e',
        }
      }
    },
  },
  plugins: [],
}
