/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brandBlue: '#0038FF',
        brandNeon: '#CCFF00',
        brandNavy: '#001A99',
        brandOffWhite: '#F8F9FA',
        accent: {
          DEFAULT: '#0038FF',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#0038FF',
          600: '#0030db',
          700: '#0026b3',
          800: '#001c8c',
          900: '#001A99',
        },
        surface: '#ffffff',
        surfaceLight: '#f8fafc',
        bg: '#0038FF',
        bgDark: '#001A99',
        background: '#0038FF',
        foreground: '#0f172a',
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        border: '#e2e8f0',
        primary: {
          DEFAULT: '#0038FF',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#CCFF00',
          foreground: '#000000',
        },
        destructive: '#ef4444',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0,0,0,0.05), 0 1px 4px -1px rgba(0,0,0,0.03)',
        'elevated': '0 8px 30px -4px rgba(0,0,0,0.06), 0 2px 8px -2px rgba(0,0,0,0.03)',
        'float': '0 16px 40px -8px rgba(0,153,153,0.14), 0 4px 14px -2px rgba(0,0,0,0.04)',
        'glow': '0 0 0 3px rgba(0,153,153,0.18)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 6px 16px -4px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
