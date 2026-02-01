/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Fredoka', 'sans-serif'],
      },
      colors: {
        hex: {
          start: '#FCD34D', // Yellow-300
          end: '#4ADE80',   // Green-400
          path: '#60A5FA',  // Blue-400
          bg: '#000000',    // Black
          stroke: '#78350F', // Amber-900
        }
      },
      animation: {
        'shake': 'shake 0.2s ease-in-out 2',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        }
      }
    }
  },
  plugins: [],
}
