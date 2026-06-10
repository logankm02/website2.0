/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      gradientColorStops: {
        // Sky gradient behind the /classic 3D scene
        sunset: "#551764, #FFA07A",
      },
      backgroundImage: {
        // Hero banner on /about (no-video variant)
        banner: "url('/cover.jpeg')",
      },
      fontFamily: {
        sans: ["Lexend", "sans-serif"],
      },
    },
  },
  plugins: [],
};
