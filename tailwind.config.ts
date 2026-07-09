
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        primary: "#4f46e5",
        "background-light": "#f8fafc",
        "background-dark": "#f8fafc", /* overridden for safety */
        "card-dark": "rgba(255, 255, 255, 0.7)", /* overridden */
        "card-dark-2": "#ffffff",
      },
      borderRadius: {
        DEFAULT: "12px",
        xl: "20px",
      },
      boxShadow: {
        glow: "0 0 24px rgba(79, 70, 229, 0.3)",
        "glow-sm": "0 0 12px rgba(79, 70, 229, 0.2)",
        card: "0 8px 32px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
