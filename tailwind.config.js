/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        rye: ['var(--font-rye)', 'serif'],
        special: ['var(--font-special-elite)', 'monospace'],
      },
      colors: {
        wood: {
          900: '#1a0f00',
          800: '#2c1810',
          700: '#3e2723',
        },
        parchment: {
          DEFAULT: '#d4b896',
          dark: '#c4a882',
          light: '#e6d5b8',
        },
        ink: {
          DEFAULT: '#2c1810',
          light: '#4a2f25',
        },
        cream: '#f0e6d3',
        wanted: '#e8c547',
        blood: '#8b2020',
        frontier: '#2d5a27',
      },
      backgroundImage: {
        'wood-pattern': "url('/wood.png')",
      }
    },
  },
  plugins: [],
}
