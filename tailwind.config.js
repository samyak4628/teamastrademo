/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f6f2',
          100: '#dcece1',
          200: '#bbdbc7',
          300: '#8ec3a4',
          400: '#5da47d',
          500: '#3c8760',
          600: '#2b6b4b',
          700: '#24563d',
          800: '#1e4633',
          900: '#183a2b',
          950: '#0d2118',
        },
        limeaccent: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#c8f34d',
          400: '#bbf246',
          500: '#a3e635',
          600: '#84cc16',
          700: '#65a30d',
          800: '#4d7c0f',
          900: '#3f6212',
        },
        brand: {
          dark: '#12261b',
          light: '#f7f9f6',
          surface: '#ffffff',
          border: '#e4eae1',
          muted: '#5c6f63',
          card: '#f9fbf8'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(18, 38, 27, 0.06)',
        'glow': '0 0 40px rgba(190, 242, 70, 0.25)',
        'forest': '0 12px 35px -8px rgba(18, 38, 27, 0.22)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}
