/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Paleta principal da marca (background #A855F7, texto #FFFFFF)
        primary: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7', // cor principal
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87'
        },
        secondary: {
          500: '#F97316',
          600: '#EA580C'
        },
        // Fundo escuro roxo usado na seção "pricing"
        'dark-purple': '#1E1035'
      }
    }
  },
  plugins: []
};


