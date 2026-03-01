"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  BarChart3,
  FileText,
  Users,
  PlusCircle,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  const mainLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/companies", icon: Building2, label: "Companies" },
    { href: "/prep", icon: ClipboardList, label: "Prep" },
    { href: "/tracker", icon: BarChart3, label: "Tracker" },
  ];

  const secondaryLinks = [
    { href: "/resume", icon: FileText, label: "Resume" },
    { href: "/submit", icon: PlusCircle, label: "Submit" },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside className="w-20 fixed top-0 left-0 h-screen flex flex-col items-center py-8 border-r border-white/5 bg-background-dark z-50">
      {/* Logo */}
      <div className="mb-12">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
          P
        </Link>
      </div>

      {/* Main nav icons */}
      <nav className="flex flex-col gap-3 flex-1 items-center">
        {mainLinks.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`p-3 rounded-xl transition-all group relative ${
              isActive(href)
                ? "sidebar-icon-active text-white shadow-lg shadow-primary/20"
                : "text-slate-400 hover:bg-white/5"
            }`}
            title={label}
          >
            <Icon size={20} />
            {/* Tooltip */}
            <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-card-dark border border-white/10 text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              {label}
            </span>
          </Link>
        ))}

        {/* Divider */}
        <div className="w-8 h-px bg-white/5 my-2" />

        {secondaryLinks.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`p-3 rounded-xl transition-all group relative ${
              isActive(href)
                ? "sidebar-icon-active text-white shadow-lg shadow-primary/20"
                : "text-slate-400 hover:bg-white/5"
            }`}
            title={label}
          >
            <Icon size={20} />
            <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-card-dark border border-white/10 text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {/* User avatar at bottom */}
      <div className="mt-auto">
        <Link
          href="/profile"
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 p-0.5 flex items-center justify-center bg-primary/10 text-primary font-bold text-sm"
          title="Profile"
        >
          {user?.name?.charAt(0).toUpperCase() ?? "?"}
        </Link>
      </div>
    </aside>
  );
}
