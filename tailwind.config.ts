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
        syne: ["var(--font-syne)", "sans-serif"],
        dm: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        bg: "#0a0a0f",
        surface: "#111118",
        surface2: "#1a1a24",
        accent: {
          DEFAULT: "#6c63ff",
          pink: "#ff6584",
          green: "#43e97b",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.06)",
          2: "rgba(255,255,255,0.1)",
        },
        muted: {
          DEFAULT: "#7878a0",
          2: "#4a4a68",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        glow: "0 0 24px rgba(108,99,255,0.4)",
        "glow-green": "0 0 12px rgba(67,233,123,0.4)",
        "glow-pink": "0 0 12px rgba(255,101,132,0.4)",
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
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(108,99,255,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(255,101,132,0.06) 0%, transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
