/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#0E1116',
        pearl: '#F7F7F5',
        pearlSoft: '#FCFCFC',
        slateText: '#3A3F47',
        silver: '#9CA3AF',
        mist: '#E5E7EB',
        bordeaux: {
          DEFAULT: '#7B1E1E',
          dark: '#651616',
        },
        success: '#1F6F4A',
        warning: '#B8860B',
        danger: '#8B1F1F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(14,17,22,0.04), 0 1px 2px rgba(14,17,22,0.06)',
        cardHover: '0 4px 12px rgba(14,17,22,0.06), 0 2px 4px rgba(14,17,22,0.05)',
      },
      fontFeatureSettings: {
        tnum: '"tnum"',
      },
    },
  },
  plugins: [],
};
