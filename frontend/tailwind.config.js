export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: "0 10px 40px rgba(16, 185, 129, 0.25)"
      },
      backgroundImage: {
        'hero-grid': "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.14) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};
