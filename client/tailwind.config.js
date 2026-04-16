/** @type {import('tailwindcss').Config} */
module.exports = {
  // FIX QUAN TRỌNG: Path đã sai - project KHÔNG có folder src/
  // Folder thực tế là ./app/, ./components/, ./lib/, ./context/
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#666666',
        accent: '#ff4444',
      },
      // Map font Inter từ next/font vào Tailwind
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};