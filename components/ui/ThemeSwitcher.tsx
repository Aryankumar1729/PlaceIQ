"use client";

import { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { useTheme, themes } from "@/components/providers/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:border-primary/40 transition-all"
        title="Change theme"
      >
        <Palette size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-white/10 shadow-xl overflow-hidden animate-fade-up"
          style={{ background: "#121216" }}>
          <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-3 pt-3 pb-1.5">
            Theme
          </p>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all hover:bg-white/5
                ${theme === t.id ? "text-slate-100 font-medium" : "text-slate-400"}`}
            >
              <span className="text-base">{t.emoji}</span>
              <span>{t.label}</span>
              {theme === t.id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
