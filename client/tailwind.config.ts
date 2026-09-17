import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          soft: 'rgb(var(--color-ink-soft) / <alpha-value>)',
          faint: 'rgb(var(--color-ink-faint) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--color-line) / <alpha-value>)',
          soft: 'rgb(var(--color-line-soft) / <alpha-value>)',
        },
        accent: {
          50: '#E7F8EE',
          100: '#C9F0D9',
          200: '#93E0B3',
          300: '#5CCB8C',
          400: '#2EB86C',
          500: '#00A651',
          600: '#008C45',
          700: '#00713A',
          800: '#00592E',
          900: '#004624',
        },
        clay: '#E9483F',
        gold: '#F5AF02',
        leaf: '#00A651',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Arial', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1400px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20, 20, 20, 0.06)',
        card: '0 1px 2px rgba(20, 20, 20, 0.05)',
        hover: '0 4px 14px rgba(20, 20, 20, 0.12)',
      },
      letterSpacing: {
        tightish: '-0.01em',
        wideish: '0.04em',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
