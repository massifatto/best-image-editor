/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        editor: {
          bg: '#f0f0f0',
          surface: '#ffffff',
          border: '#e2e2e2',
          active: '#3b82f6',
          hover: '#f5f5f5',
          text: '#1f2937',
          muted: '#6b7280',
        },
      },
    },
  },
  plugins: [],
};
