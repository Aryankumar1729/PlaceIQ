"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import { PlusCircle } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/companies", label: "Companies" },
  { href: "/prep", label: "Prep" },
  { href: "/tracker", label: "Tracker" },
];

type UserType = {
  name: string;
  email: string;
  college?: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-border bg-bg/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2 font-syne font-extrabold text-xl tracking-tight">
        <span
          className="w-2 h-2 rounded-full bg-accent"
          style={{ boxShadow: "0 0 10px var(--accent)", animation: "pulse-glow 2s infinite" }}
        />
        PlaceIQ
      </div>

      {/* Links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`nav-link ${pathname.startsWith(link.href) ? "active" : ""}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/submit"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/30 text-accent text-xs font-medium hover:bg-accent/10 transition-all"
      >
        <PlusCircle size={13} />
        Submit Question
      </Link>
      {/* Right side */}
      <div className="flex items-center gap-3">
        <ThemeSwitcher />

        {user ? (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface2 border border-border-2 hover:border-accent/40 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center font-syne font-bold text-xs text-accent">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium max-w-[100px] truncate">
                {user.name?.split(" ")[0]}
              </span>
              <ChevronDown size={14} className="text-muted" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-12 w-52 rounded-xl border border-border-2 shadow-card overflow-hidden animate-fade-up z-50"
                style={{ background: "var(--surface)" }}
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                  {user.college && (
                    <p className="text-xs text-muted-2 mt-0.5 truncate">{user.college}</p>
                  )}
                </div>

                {/* Actions */}
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-[var(--text)] hover:bg-surface2 transition-all"
                >
                  <User size={14} />
                  View Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent-pink hover:bg-accent-pink/10 transition-all"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn-primary">
            Login →
          </Link>
        )}
      </div>
    </nav>
  );
}
