import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bevanssons brand palette (matches client/tailwind.config.js on
        // the Bevans Sons platform) — was Daisy's own #D4AF37/#0A0A0A set.
        gold: {
          DEFAULT: "#C8B993",
          light: "#DDD2B7",
          dark: "#9C8F72",
        },
        dark: {
          DEFAULT: "#111111",
          card: "#1D1D1D",
          border: "#2A2A2A",
          surface: "#1A1A1A",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
