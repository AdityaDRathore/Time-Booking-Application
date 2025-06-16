// This file is used to configure Tailwind CSS for the project.
// It specifies the content files to scan for class names and extends the default theme with custom colors.
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          dark: '#1e40af',    // blue-800
        },
        secondary: {
          DEFAULT: '#6b7280', // gray-500
          dark: '#374151',    // gray-700
        },
      },
      fontFamily: {
        sans: ['"Public Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}