/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      desktop: '850px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'green-deep':     '#0D1E2B',   /* bleu très sombre — fonds de sections */
        'green-accent':   '#425F73',   /* bleu principal  (66 95 115)          */
        'teal-accent':    '#6B90A8',   /* bleu moyen                           */
        'cyan-accent':    '#8AAFC5',   /* bleu clair                           */
        'site-bg':        '#FAFAFA',
        'text-primary':   '#1A2832',
        'text-secondary': '#3D5870',
        'footer-bg':      '#091520',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      backdropBlur: {
        xl: '20px',
      },
    },
  },
  plugins: [],
}
