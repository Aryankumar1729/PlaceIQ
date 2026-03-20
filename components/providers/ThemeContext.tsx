"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type Theme = "dark" | "midnight" | "light";

export const themes: { id: Theme; label: string; emoji: string; description: string }[] = [
  { id: "dark", label: "Dark", emoji: "🌙", description: "Classic dark with soft contrast" },
  { id: "midnight", label: "Midnight", emoji: "🌌", description: "Deep navy for long prep sessions" },
  { id: "light", label: "Light", emoji: "☀️", description: "Minimal modern palette inspired by productivity dashboards" },
];

export const themeVars: Record<Theme, Record<string, string>> = {
  dark: {
    "--color-primary": "99 102 241",
    "--color-bg": "10 10 12",
    "--color-card": "18 18 22",
    "--color-card-2": "24 24 30",
    "--mesh-a": "99 102 241",
    "--mesh-b": "168 85 247",
    "--selection-bg": "99 102 241",
    "--selection-text": "255 255 255",
  },
  midnight: {
    "--color-primary": "129 140 248",
    "--color-bg": "5 5 16",
    "--color-card": "13 13 31",
    "--color-card-2": "23 23 44",
    "--mesh-a": "79 70 229",
    "--mesh-b": "59 130 246",
    "--selection-bg": "129 140 248",
    "--selection-text": "255 255 255",
  },
  light: {
    "--color-primary": "79 70 229",
    "--color-bg": "244 246 252",
    "--color-card": "255 255 255",
    "--color-card-2": "238 242 255",
    "--mesh-a": "99 102 241",
    "--mesh-b": "129 140 248",
    "--selection-bg": "79 70 229",
    "--selection-text": "255 255 255",
  },
};

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: "dark", setTheme: () => { } });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    const vars = themeVars[t];

    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    root.classList.remove("theme-dark", "theme-midnight", "theme-light");
    root.classList.add(`theme-${t}`);
    root.setAttribute("data-theme", t);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("placeiq-theme", t);
    applyTheme(t);
  };

  useEffect(() => {
    const saved = localStorage.getItem("placeiq-theme") as Theme | null;
    const initialTheme = saved && themeVars[saved] ? saved : "dark";
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
