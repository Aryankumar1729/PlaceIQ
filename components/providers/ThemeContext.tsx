"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type Theme = "dark" | "midnight";

export const themes: { id: Theme; label: string; emoji: string }[] = [
  { id: "dark", label: "Dark", emoji: "🌙" },
  { id: "midnight", label: "Midnight", emoji: "🔵" },
];

// We use Tailwind classes directly now — theme vars are minimal
export const themeVars: Record<Theme, Record<string, string>> = {
  dark: {
    "--bg-dark": "#0a0a0c",
    "--card-dark": "#121216",
    "--primary": "#6366f1",
  },
  midnight: {
    "--bg-dark": "#050510",
    "--card-dark": "#0d0d1f",
    "--primary": "#818cf8",
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
