/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        theme: {
          primary: 'var(--color-primary)',
          accent: 'var(--color-accent)',
          secondary: 'var(--color-secondary)',
          background: 'var(--color-background)',
        },
      },
      fontSize: {
        theme: 'var(--font-size-base)',
      },
      transitionDuration: {
        theme: 'var(--animation-speed)',
      },
      textColor: {
        'theme-primary': 'var(--color-primary)',
        'theme-accent': 'var(--color-accent)',
        'theme-secondary': 'var(--color-secondary)',
      },
      backgroundColor: {
        'theme-primary': 'var(--color-primary)',
        'theme-accent': 'var(--color-accent)',
        'theme-secondary': 'var(--color-secondary)',
        'theme-background': 'var(--color-background)',
      },
      borderColor: {
        'theme-primary': 'var(--color-primary)',
        'theme-accent': 'var(--color-accent)',
        'theme-secondary': 'var(--color-secondary)',
      },
    },
  },
  plugins: [],
} 