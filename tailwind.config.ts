import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.2, 0.6, 0.3, 1) infinite',
        'spin-slow': 'spin-slow 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
