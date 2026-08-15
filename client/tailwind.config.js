/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Editorial "Knowledge Instrument" aesthetic
        // Warm paper foundation
        'surface-paper': '#faf7f0',      // Warm off-white/cream background
        'surface-light': '#f5f2ed',      // Slightly darker than paper
        'surface-inset': '#ebe8e1',      // Inset panel background
        
        // Text hierarchy
        'text-primary': '#1a1a1a',       // Deep graphite/charcoal
        'text-secondary': '#6b6b6b',     // Muted gray
        'text-tertiary': '#999999',      // Light gray (secondary copy)
        'text-disabled': '#b8b8b8',      // Disabled state
        
        // Borders and dividers
        'border-light': '#e0ddd6',       // Restrained neutral border
        'border-medium': '#d4d1ca',      // Slightly stronger border
        'border-dark': '#b8b5ae',        // Dark border for emphasis
        
        // Action accent - Vermilion
        'accent-primary': '#d64f3c',     // Vermilion red-orange
        'accent-dark': '#b83d2a',        // Darker vermilion
        'accent-light': '#e88574',       // Lighter vermilion
        
        // Semantic states (muted palette)
        'state-success': '#5a8e5a',      // Muted green
        'state-warning': '#b8934f',      // Muted golden
        'state-error': '#a85550',        // Muted red
        'state-info': '#4a7fa8',         // Muted blue
      },
      fontFamily: {
        'serif': ['Georgia', 'Garamond', 'serif'],
        'sans': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Helvetica Neue"', 'sans-serif'],
        'mono': ['"SF Mono"', '"Monaco"', '"Cascadia Code"', 'monospace'],
      },
      fontSize: {
        // Headings - Serif for display, sans for body hierarchy
        'display': ['48px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '500' }],   // Large feature headline
        'h1': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '500' }],         // Section headline
        'h2': ['24px', { lineHeight: '1.3', letterSpacing: '0em', fontWeight: '600' }],             // Subsection
        'h3': ['18px', { lineHeight: '1.35', letterSpacing: '0em', fontWeight: '600' }],            // Small heading
        'h4': ['16px', { lineHeight: '1.4', letterSpacing: '0em', fontWeight: '600' }],             // Component title
        // Body text
        'body': ['16px', { lineHeight: '1.65', letterSpacing: '0em', fontWeight: '400' }],          // Default paragraph
        'body-sm': ['14px', { lineHeight: '1.6', letterSpacing: '0em', fontWeight: '400' }],        // Secondary text
        'body-xs': ['13px', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '400' }],        // Tertiary text
        // Labels and metadata
        'label': ['12px', { lineHeight: '1.4', letterSpacing: '0px', fontWeight: '600' }],          // Form labels
        'caption': ['12px', { lineHeight: '1.4', letterSpacing: '0px', fontWeight: '400' }],        // Helper/meta text
        'overline': ['11px', { lineHeight: '1.3', letterSpacing: '0.05em', fontWeight: '600' }],    // Section label
        // Button text
        'button': ['15px', { lineHeight: '1.4', letterSpacing: '0px', fontWeight: '600' }],         // Button labels
      },
      spacing: {
        xs: '0.25rem',  // 4px
        sm: '0.5rem',   // 8px
        md: '0.75rem',  // 12px
        base: '1rem',   // 16px
        lg: '1.25rem',  // 20px
        xl: '1.5rem',   // 24px
        '2xl': '2rem',  // 32px
        '3xl': '2.5rem', // 40px
        '4xl': '3rem',  // 48px
        '5xl': '3.5rem', // 56px
        '6xl': '4rem',  // 64px
      },
      borderRadius: {
        'none': '0',
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      borderWidth: {
        '1': '1px',
        '2': '2px',
      },
      boxShadow: {
        'none': 'none',
        'inset': 'inset 0 1px 3px rgba(26, 26, 26, 0.05)',
        'sm': '0 1px 2px rgba(26, 26, 26, 0.08)',
        'md': '0 2px 4px rgba(26, 26, 26, 0.1)',
        'lg': '0 4px 8px rgba(26, 26, 26, 0.12)',
        'xl': '0 8px 16px rgba(26, 26, 26, 0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
      },
    },
  },
  plugins: [],
};