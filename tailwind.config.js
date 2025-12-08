/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add your Figma design tokens here
        primary: {
          DEFAULT: '#007AFF',
          light: '#5AC8FA',
          dark: '#0051D5',
        },
        secondary: {
          DEFAULT: '#5856D6',
          light: '#AF52DE',
          dark: '#3634A3',
        },
      },
      fontFamily: {
        // Add your custom fonts from Figma
      },
      spacing: {
        // Add custom spacing from your design system
      },
    },
  },
  plugins: [],
}
