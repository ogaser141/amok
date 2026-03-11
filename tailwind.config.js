/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AmOK primary — Emerald Green
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease',
        'slide-up':  'slideUp 0.45s cubic-bezier(0.22,1,0.36,1)',
        'pop':       'pop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-soft':'pulseSoft 2s ease-in-out infinite',
        'shimmer':   'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeIn:    { from:{ opacity:0 }, to:{ opacity:1 } },
        slideUp:   { from:{ opacity:0, transform:'translateY(20px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        pop:       { from:{ transform:'scale(0.88)', opacity:0 }, to:{ transform:'scale(1)', opacity:1 } },
        pulseSoft: { '0%,100%':{ opacity:1 }, '50%':{ opacity:.6 } },
        shimmer:   { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
      },
    },
  },
  plugins: [],
};
