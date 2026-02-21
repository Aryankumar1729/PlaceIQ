"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type Theme = "dark" | "light" | "midnight" | "forest";

export const themes: { id: Theme; label: string; emoji: string }[] = [
  { id: "dark", label: "Dark", emoji: "🌙" },
  { id: "midnight", label: "Midnight", emoji: "🔵" },
  { id: "forest", label: "Forest", emoji: "🌿" },
];

export const themeVars: Record<Theme, Record<string, string>> = {
  dark: {
    "--bg": "#0a0a0f",
    "--surface": "#111118",
    "--surface2": "#1a1a24",
    "--border": "rgba(255,255,255,0.06)",
    "--border2": "rgba(255,255,255,0.1)",
    "--accent": "#6c63ff",
    "--accent-pink": "#ff6584",
    "--accent-green": "#43e97b",
    "--text": "#f0f0f8",
    "--muted": "#7878a0",
    "--muted2": "#4a4a68",
  },
  light: {
    "--bg": "#f0f0f8",
    "--surface": "#ffffff",
    "--surface2": "#f0f0f8",
    "--border": "rgba(0,0,0,0.08)",
    "--border2": "rgba(0,0,0,0.14)",
    "--accent": "#6c63ff",
    "--accent-pink": "#ff6584",
    "--accent-green": "#16a34a",
    "--text": "#0f0f1a",
    "--muted": "#555577",
    "--muted2": "#9999bb",
  },
  midnight: {
    "--bg": "#050510",
    "--surface": "#0d0d1f",
    "--surface2": "#141428",
    "--border": "rgba(100,100,255,0.08)",
    "--border2": "rgba(100,100,255,0.15)",
    "--accent": "#818cf8",
    "--accent-pink": "#f472b6",
    "--accent-green": "#34d399",
    "--text": "#e0e0ff",
    "--muted": "#6868a0",
    "--muted2": "#404070",
  },
  forest: {
    "--bg": "#080f0a",
    "--surface": "#0f1a11",
    "--surface2": "#162219",
    "--border": "rgba(100,255,100,0.06)",
    "--border2": "rgba(100,255,100,0.1)",
    "--accent": "#4ade80",
    "--accent-pink": "#fb923c",
    "--accent-green": "#86efac",
    "--text": "#e8f5ea",
    "--muted": "#6a9a72",
    "--muted2": "#3a5e42",
  },
};

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: "dark", setTheme: () => { } });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("placeiq-theme", t);
    const vars = themeVars[t];
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("placeiq-theme") as Theme | null;
    if (saved && themeVars[saved]) setTheme(saved);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
