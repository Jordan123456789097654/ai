import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111014",
        surface: "#17161C",
        "surface-raised": "#1E1D25",
        border: "#2B2A33",
        accent: "#F0A202",
        "accent-dim": "#8A6212",
        signal: "#2DD4BF",
        text: "#EDEBF0",
        muted: "#8D8A99",
        success: "#4ADE80",
        danger: "#F0533D",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
