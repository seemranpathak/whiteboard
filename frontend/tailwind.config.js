// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }
//....................................................

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Add Inter font
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        border: 'hsl(var(--border))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        'toolbar-bg': 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
        'tool-border': 'hsl(214.3 31.8% 91.4%)', // Light gray border
        'canvas-bg': 'white',
      },
      boxShadow: {
        toolbar: '0 4px 12px rgba(0, 0, 0, 0.1)',
        floating: '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'gradient-canvas': 'linear-gradient(to br, hsl(var(--background)), hsl(var(--muted)))',
      },
    },
  },
  plugins: [],
};