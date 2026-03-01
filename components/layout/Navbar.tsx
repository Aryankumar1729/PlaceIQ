"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { User, LogOut, ChevronDown, Bell } from "lucide-react";

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
      .then((data) => setUser(data.user))
      .catch(() => {});
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
    <header className="px-6 md:px-12 py-5 flex justify-between items-center border-b border-transparent">
      {/* Nav links */}
      <div className="flex items-center gap-8">
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "text-primary"
                  : "text-slate-400 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        <div className="h-6 w-px bg-white/10" />

        {user ? (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-3 pl-2 group"
            >
              <span className="text-sm font-medium text-white">{user.name?.split(" ")[0]}</span>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-10 w-52 rounded-2xl border border-white/10 bg-card-dark shadow-2xl shadow-black/40 overflow-hidden animate-fade-up z-50"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  {user.college && (
                    <p className="text-xs text-slate-600 mt-0.5 truncate">{user.college}</p>
                  )}
                </div>

                {/* Actions */}
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <User size={14} />
                  View Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-pink-400 hover:bg-pink-500/10 transition-all"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn-primary text-sm px-5 py-2">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
