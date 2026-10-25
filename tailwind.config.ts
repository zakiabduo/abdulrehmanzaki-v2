import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    screens: { sm: "480px", md: "768px", lg: "1025px", xl: "1441px", "2xl": "1921px" },
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        line: "rgb(var(--ink) / 0.16)",
      },
      fontFamily: {
        display: ['"Archivo Variable"', "Arial Narrow", "Arial", "sans-serif"],
        serif: ['"Newsreader Variable"', "Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
