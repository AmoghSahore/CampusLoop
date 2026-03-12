export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1d9a6c',
          light:   '#e3f5ec',
          hover:   '#178058',
          fg:      '#ffffff',
        },
        accent: {
          DEFAULT: '#f59e0b',
          light:   '#fef3c7',
        },
        border:  '#d6e9de',
        bg:      '#f4faf6',
        'bg-alt':'#edf7f2',
        card:    '#ffffff',
      },
      boxShadow: {
        'glow-green':  '0 4px 24px rgba(29,154,108,0.3)',
        'card':        '0 1px 3px rgba(0,0,0,0.06)',
        'card-hover':  '0 16px 40px rgba(0,0,0,0.12)',
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #1d9a6c 0%, #178058 100%)',
        'grad-hero':    'linear-gradient(135deg, #0f2d1e 0%, #1a5c3a 50%, #0e3d26 100%)',
        'dot-grid':     'radial-gradient(circle at 1px 1px, rgba(29,154,108,0.08) 1px, transparent 0)',
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
