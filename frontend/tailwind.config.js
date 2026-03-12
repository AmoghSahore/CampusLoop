export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          light:   '#eef2ff',
          hover:   '#4338ca',
          fg:      '#ffffff',
        },
        accent: {
          DEFAULT: '#f97316',
          light:   '#fff7ed',
        },
        border:  '#e2e8f0',
        bg:      '#f8fafc',
        'bg-alt':'#f1f5f9',
        card:    '#ffffff',
      },
      boxShadow: {
        'glow-green':  '0 4px 24px rgba(79,70,229,0.3)',
        'card':        '0 1px 3px rgba(0,0,0,0.06)',
        'card-hover':  '0 16px 40px rgba(0,0,0,0.12)',
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
        'grad-hero':    'linear-gradient(135deg, #0f0e1a 0%, #1c1456 50%, #0a0818 100%)',
        'dot-grid':     'radial-gradient(circle at 1px 1px, rgba(79,70,229,0.07) 1px, transparent 0)',
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
      animation: {
        float:   'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      scale: {
        '108': '1.08',
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
    },
  },
  plugins: [],
};
