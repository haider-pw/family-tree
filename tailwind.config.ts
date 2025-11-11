import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'heritage-green': {
          DEFAULT: '#0F5F4A',
          dark: '#0D4F3D',
        },
        'heritage-gold': {
          DEFAULT: '#D4AF37',
          dark: '#C09E2F',
        },
        'heritage-teal': '#14B8A6',
        'parchment': '#FDFBF7',
        'forest-dark': '#1A1F1C',
        'surface-dark': '#243831',
        'text-primary-light': '#1E2D27',
        'text-secondary-light': '#5A6B64',
        'text-primary-dark': '#F5F3EE',
        'text-secondary-dark': '#A8B5AF',
      },
    },
  },
  plugins: [],
} satisfies Config
