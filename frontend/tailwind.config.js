/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        credix: {
          bg: '#f5f4fd',
          text: '#2e335b',
          muted: 'rgba(46, 51, 91, 0.75)',
          element: '#dfe7f9',
          stroke: '#cdd0e5',
          card: '#ffffff',
          accent: '#2e335b',
          soft: '#eef2fc',
          purple: '#6366f1',
        },
        midnight: {
          950: '#05010f',
          900: '#0a0618',
          850: '#0f0a24',
          800: '#151030',
          700: '#1e1745',
        },
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        credix: '0 8px 30px rgba(46, 51, 91, 0.07)',
        'credix-hover': '0 20px 40px rgba(46, 51, 91, 0.12)',
        'credix-card': '0 4px 24px rgba(46, 51, 91, 0.05)',
        'glow-soft': '0 0 50px rgba(99, 102, 241, 0.25)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
