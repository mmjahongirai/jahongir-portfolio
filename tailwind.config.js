/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          elevated: 'var(--bg-elevated)',
          card: 'var(--bg-card)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-muted)',
        },
        brand: {
          black: '#000000',
          white: '#f5f5f7',
          gray: {
            50: '#f5f5f7',
            100: '#e8e8ed',
            200: '#d2d2d7',
            300: '#86868b',
            400: '#6e6e73',
            500: '#515154',
            600: '#424245',
            700: '#333336',
            800: '#1d1d1f',
            900: '#161617',
            950: '#000000',
          },
        },
        accent: {
          yellow: '#67e8f9',
          'yellow-dark': '#22b8d6',
          'yellow-light': '#b9f7ff',
          blue: '#8b5cf6',
          'blue-dark': '#725cff',
          'blue-light': '#a695ff',
          link: '#5b8cff',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
          hover: 'var(--border-hover)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        'display-xl': ['clamp(3.25rem,7.5vw,6.5rem)', { lineHeight: '0.92', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-lg': ['clamp(2.5rem,5.5vw,4.75rem)', { lineHeight: '0.95', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['clamp(1.875rem,3.75vw,3.25rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['clamp(1.5rem,2.75vw,2.125rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      borderRadius: {
        apple: '1.125rem',
        pill: '980px',
      },
      boxShadow: {
        'apple-sm': 'var(--shadow-sm)',
        'apple-md': 'var(--shadow-md)',
        'apple-lg': 'var(--shadow-lg)',
        'apple-glass': 'var(--shadow-glass)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in-down': 'fadeInDown 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'text-shimmer': 'textShimmer 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        textShimmer: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,187,63,0.12)' },
          '50%': { boxShadow: '0 0 40px rgba(201,187,63,0.2)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh': 'linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)',
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
};
