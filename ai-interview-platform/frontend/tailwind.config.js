/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        /* CSS-variable driven color tokens */
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        cta: 'var(--color-cta)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        page: 'var(--color-bg)',
        brand: 'var(--color-primary-500)',
        orb: 'var(--color-orb)',
        text: 'var(--color-text)',
        /* Helpful named fallbacks */
        terracotta: '#E2725B',
        'warm-cream': '#FFFDD0',
        espresso: '#2B1E16',
        'neon-cyan': '#00FFFF',
        obsidian: '#121212',
        'deep-charcoal': '#1E1E1E',
        platinum: '#E5E4E2',
        cobalt: '#0047AB',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-3d': 'float3d 6s ease-in-out infinite',
        'tilt-3d': 'tilt3d 8s ease-in-out infinite',
        'rotate-3d-slow': 'rotate3dSlow 12s linear infinite',
        'neon-glow': 'neonGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float3d: {
          '0%': { transform: 'translateY(0) translateZ(0) rotateX(0) rotateY(0)' },
          '50%': { transform: 'translateY(-12px) translateZ(20px) rotateX(2deg) rotateY(2deg)' },
          '100%': { transform: 'translateY(0) translateZ(0) rotateX(0) rotateY(0)' },
        },
        tilt3d: {
          '0%': { transform: 'perspective(1000px) rotateX(0) rotateY(0)' },
          '50%': { transform: 'perspective(1000px) rotateX(3deg) rotateY(-3deg)' },
          '100%': { transform: 'perspective(1000px) rotateX(0) rotateY(0)' },
        },
        rotate3dSlow: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        neonGlow: {
          '0%': { boxShadow: '0 0 6px rgba(0,255,255,0.12), 0 0 20px rgba(0,71,171,0.03)' },
          '50%': { boxShadow: '0 0 20px rgba(0,255,255,0.18), 0 0 40px rgba(0,71,171,0.06)' },
          '100%': { boxShadow: '0 0 6px rgba(0,255,255,0.12), 0 0 20px rgba(0,71,171,0.03)' },
        },
      },
    },
  },
  plugins: [],
}
