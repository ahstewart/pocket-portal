/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        // Primary: Chestnut Brown — buttons, app bars, active states
        primary: {
          50:  '#fdf4f0',
          100: '#fae5d8',
          200: '#f3c4a8',
          300: '#e89a72',
          400: '#d96e44',
          500: '#be5030',
          600: '#8C3A21',
          700: '#752f1b',
          800: '#5d2515',
          900: '#3f190d',
        },
        // Secondary: Golden Amber — supported badge, highlights
        secondary: {
          50:  '#fefaed',
          100: '#fef0c3',
          200: '#fce08a',
          300: '#f9c94d',
          400: '#f2b52b',
          500: '#E5A91A',
          600: '#c48e14',
          700: '#9a700f',
          800: '#75560b',
          900: '#4f3a07',
        },
        // Accent: Slate Blue — pending badge, borders, inactive states
        accent: {
          50:  '#f2f5f7',
          100: '#e3eaed',
          200: '#c5d3d8',
          300: '#a0b8be',
          400: '#829CA5',
          500: '#68828c',
          600: '#526870',
          700: '#3f5058',
          800: '#2c3940',
          900: '#1b252a',
        },
        // Dark: Plumage Black — primary text, dark backgrounds
        dark:  '#1A1A1A',
        // Light: Lily Pad White — app backgrounds, card surfaces
        light: '#F5F5F5',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'sm-soft': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md-soft': '0 4px 6px -1px rgb(0 0 0 / 0.06)',
        'lg-soft': '0 10px 15px -3px rgb(0 0 0 / 0.08)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}