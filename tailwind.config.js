/** @type {import('tailwindcss').Config} */
export default {
    content: ["../public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: "#00796B",
          secondary: "#64B447",
          cyanLS: "#3FA9F5",
          blackLS: "#272727",
          whiteLS: "#EAECF1"
        },
        backgroundImage: {
          "BgAuthLS": "url(../../../src/images/bg-blob.svg)",
        },
        fontFamily: {
          Outfit: ['Outfit', 'sans-serif'],
          RobotoCondensed: ['RobotoCondensed', 'sans-serif']
        }
      },
    },
    plugins: [],
  };
  