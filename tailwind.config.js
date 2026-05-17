/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#101820',
        'charcoal-deep': '#0A0F14',
        'charcoal-light': '#1E2A35',
        'charcoal-lighter': '#2D3A47',
        'charcoal-border': '#2D3A47',
        mint: '#0CD4A0',
        'mint-dark': '#0AB889',
        'mint-light': '#4EEDC4',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'app-sm': '2px',
        app: '4px',
        'app-md': '6px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.3)',
        modal: '0 4px 16px rgba(0,0,0,0.5)',
        dropdown: '0 2px 8px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
