import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        primary: "#6366f1",
        "background-light": "#ffffff",
        "background-dark": "#0a0a0c",
        "card-dark": "#121216",
        "card-dark-2": "#18181c",
      },
      borderRadius: {
        DEFAULT: "12px",
        xl: "20px",
      },
      boxShadow: {
        glow: "0 0 24px rgba(99,102,241,0.3)",
        "glow-sm": "0 0 12px rgba(99,102,241,0.2)",
        card: "0 8px 32px rgba(0,0,0,0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-up": "fadeUp 0.4s ease both",
        "slide-in": "slideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "scale(0.9) translateY(20px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
