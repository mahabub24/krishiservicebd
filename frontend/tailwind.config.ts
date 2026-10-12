import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        krishi: {
          primary: "#16803D",      // Primary Green
          dark: "#14532D",         // Dark Green
          light: "#F0FDF4",        // Light Green
          accent: "#EAB308",       // Accent Yellow / Gold
          gray: "#4B5563",
          border: "#E5E7EB",
        },
      },
      fontFamily: {
        bengali: ["Hind Siliguri", "Noto Sans Bengali", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
