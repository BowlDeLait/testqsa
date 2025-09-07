/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Discord color palette
        discord: {
          dark: '#2C2F33',
          darker: '#23272A',
          darkest: '#1E2124',
          light: '#99AAB5',
          lighter: '#FFFFFF',
          blurple: '#5865F2',
          'blurple-dark': '#4752C4',
          green: '#57F287',
          yellow: '#FEE75C',
          red: '#ED4245',
          'red-dark': '#C23B40',
          gray: {
            100: '#F2F3F5',
            200: '#E3E5E8',
            300: '#D1D9DE',
            400: '#B9BBBE',
            500: '#8E9297',
            600: '#72767D',
            700: '#5F6368',
            800: '#4F545C',
            900: '#36393F'
          }
        }
      },
      fontFamily: {
        'discord': ['Whitney', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}