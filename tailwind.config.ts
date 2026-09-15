import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        card: '48px',
        panel: '24px',
        mini: '20px',
        thumb: '18px',
        input: '14px',
        pill: '9999px',
      },
      colors: {
        ds: {
          gold: '#F0A62B',
          ok: '#3DD68C',
          err: '#FF5C5C',
          info: '#5CA8FF',
        },
      },
    },
  },
  plugins: [],
};

export default config;
