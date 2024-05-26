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
        malibu: "#84A4FC",
        sunsetSky: "#FFA07A",
        sunsetSun: "#FFD700", 
      },
      gradientColorStops: {
        'sunset': '#87CEEB, #FFA07A', // Light blue to sunset color
      },
      transitionDuration: {
        '500': '0.5s', // Define a transition duration of 0.5 seconds
      },
      backgroundImage: {
        'banner': "url('/cover.jpeg')",
        'sky' : "url('/nightsky.jpg')",
      },
      fontFamily: {
        'sans': ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

