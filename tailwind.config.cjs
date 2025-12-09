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
          900: '#581C87',
          // Cor do Figma para botão
          figma: '#6938EF'
        },
        // Cores do design Figma
        figma: {
          purple: '#6938EF',
          purpleDark: '#5925DC',
          purpleDarker: '#4A1FB8',
          dark: '#100F14',
          label: '#9794AA',
          placeholder: '#686677',
          border: '#CBCAD7',
          text: '#49475A',
          bg: '#FCFCFC',
          lightBg: 'rgba(244, 243, 255, 0.9)',
          reviewBg: 'rgba(74, 31, 184, 0.6)',
          textLight: '#E2E1E8',
          textWhite: '#FCFCFC',
          textGray: '#F0F0F3'
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


