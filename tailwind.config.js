/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFFDD0",
        malibu: "#84A4FC"
      },
      transitionDuration: {
        '500': '0.5s', // Define a transition duration of 0.5 seconds
      },
      backgroundImage: {
        'banner': "url('/src/assets/images/cover.jpeg')", // Update this path to your image
        'sunset': "url('/src/assets/images/sunset.jpg')",
      },
      fontFamily: {
        'sans': ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

