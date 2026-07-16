import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F7FF',
          100: '#CCE9FB',
          200: '#9BD3F6',
          300: '#66BEEE',
          400: '#36A9EA',
          500: '#0293E4',
          600: '#0277C2',
          700: '#025BA0',
          800: '#014478',
          900: '#002D50',
          light: 'var(--payment-primary-light)',
          lighter: 'var(--payment-primary-lighter)',
          pale: 'var(--payment-primary-pale)',
          muted: 'var(--payment-primary-muted)',
        },
        secondary: {
          DEFAULT: 'hsl(160, 40%, 25%)',
          light: 'hsl(160, 40%, 35%)',
        },
        success: {
          DEFAULT: 'hsl(152, 60%, 40%)',
          light: 'hsl(152, 60%, 55%)',
          fg: 'hsl(0, 0%, 100%)',
        },
        warning: {
          DEFAULT: 'hsl(38, 92%, 50%)',
          light: 'hsl(38, 92%, 55%)',
          fg: 'hsl(0, 0%, 100%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 72%, 51%)',
          light: 'hsl(0, 62%, 50%)',
          fg: 'hsl(0, 0%, 100%)',
        },
        bg: {
          DEFAULT: 'hsl(224, 20%, 5%)',
          card: 'hsl(224, 18%, 8%)',
          muted: 'hsl(224, 14%, 12%)',
        },
        fg: {
          DEFAULT: 'hsl(210, 20%, 95%)',
          muted: 'hsl(215, 15%, 55%)',
        },
        border: 'hsl(224, 14%, 14%)',
        input: 'hsl(224, 14%, 16%)',
        ring: 'hsl(187, 85%, 48%)',
        sidebar: {
          bg: 'hsl(224, 20%, 4%)',
          fg: 'hsl(215, 15%, 65%)',
          accent: 'hsl(224, 14%, 10%)',
          'accent-fg': 'hsl(210, 20%, 90%)',
          border: 'hsl(224, 14%, 12%)',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', '1rem'],
        sm: ['0.875rem', '1.25rem'],
        base: ['1rem', '1.5rem'],
        md: ['1.125rem', '1.5rem'],
        lg: ['1.25rem', '1.75rem'],
        xl: ['1.563rem', '1.9rem'],
        '2xl': ['1.953rem', '2.3rem'],
        '3xl': ['2.441rem', '2.9rem'],
        '4xl': ['3.052rem', '3.6rem'],
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.625rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
        DEFAULT: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        primary: '0 8px 16px 0 rgba(2,147,228,0.15)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(180deg, hsl(224 20% 8%) 0%, hsl(224 20% 5%) 100%)',
        'gradient-card': 'linear-gradient(135deg, hsl(224 18% 12%) 0%, hsl(224 18% 8%) 100%)',
        'gradient-primary': 'linear-gradient(135deg, hsl(187 85% 48%) 0%, hsl(187 70% 50%) 100%)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drawerIn: {
          from: { transform: 'translateX(40px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'logo-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.06)', opacity: '0.85' },
        },
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        drawerIn: 'drawerIn 0.25s ease-out',
        'logo-pulse': 'logo-pulse 2s ease-in-out infinite',
        'dot-bounce': 'dot-bounce 1.4s ease-in-out infinite',
        blob: 'blob 7s ease-in-out infinite',
        gradient: 'gradient 6s ease infinite',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.animation-delay-150': {
          animationDelay: '150ms',
        },
        '.animation-delay-300': {
          animationDelay: '300ms',
        },
        '.animation-delay-2000': {
          animationDelay: '2000ms',
        },
      });
    }),
  ],
} satisfies Config;
