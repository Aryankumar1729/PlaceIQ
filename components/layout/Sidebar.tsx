"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  BarChart3,
  FileText,
  Shield,
  PlusCircle,
} from "lucide-react";

type SidebarProps = {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

export default function Sidebar({ expanded, onExpandedChange }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (collapseTimer.current) {
        clearTimeout(collapseTimer.current);
      }
    };
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
    ...(user?.role === "admin"
      ? [{ href: "/admin/pyqs", icon: Shield, label: "Admin" }]
      : []),
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  const handleExpand = () => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    onExpandedChange(true);
  };

  const handleCollapse = () => {
    collapseTimer.current = setTimeout(() => {
      onExpandedChange(false);
    }, 140);
  };

  return (
    <aside
      onMouseEnter={handleExpand}
      onMouseLeave={handleCollapse}
      className={`fixed top-0 left-0 h-screen flex flex-col py-8 border-r border-slate-200/80 bg-white/80 backdrop-blur-lg z-50 transition-[width] duration-300 ease-out shadow-sm ${expanded ? "w-56 px-3" : "w-20 items-center px-0"}`}
    >
      {/* Logo */}
      <div className={`mb-10 ${expanded ? "px-2" : ""}`}>
        <Link
          href="/dashboard"
          className={`rounded-xl border border-slate-200 flex items-center transition-all duration-200 ease-out hover:border-primary/40 hover:bg-primary/5 ${expanded ? "h-10 px-2.5 gap-2 justify-start text-slate-900" : "w-10 h-10 justify-center bg-primary border-primary/40 shadow-md text-white hover:-translate-y-0.5"}`}
        >
          <span className={`font-extrabold tracking-tight ${expanded ? "text-sm" : "text-base"}`}>P</span>
          {expanded && (
            <span className="text-sm font-bold tracking-wide text-slate-900">PlaceIQ</span>
          )}
        </Link>
      </div>

      {/* Main nav icons */}
      <nav className={`flex flex-col gap-1.5 flex-1 ${expanded ? "items-stretch" : "items-center"}`}>
        {mainLinks.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-xl transition-all duration-200 ease-out group relative flex items-center ${expanded ? "px-3 py-2.5 gap-2.5" : "p-3 justify-center"} ${
              isActive(href)
                ? "sidebar-icon-active text-white shadow-md shadow-primary/20 font-semibold"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium"
            }`}
            title={label}
          >
            <Icon size={20} />
            {expanded && <span className="text-sm leading-none">{label}</span>}
            {/* Tooltip */}
            {!expanded && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-md">
                {label}
              </span>
            )}
          </Link>
        ))}

        {/* Divider */}
        <div className={`${expanded ? "w-full" : "w-8"} h-px bg-slate-200 my-3 transition-all duration-300`} />

        {secondaryLinks.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-xl transition-all duration-200 ease-out group relative flex items-center ${expanded ? "px-3 py-2.5 gap-2.5" : "p-3 justify-center"} ${
              isActive(href)
                ? "sidebar-icon-active text-white shadow-md shadow-primary/20 font-semibold"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium"
            }`}
            title={label}
          >
            <Icon size={20} />
            {expanded && <span className="text-sm leading-none">{label}</span>}
            {!expanded && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-md">
                {label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User avatar at bottom */}
      <div className={`mt-auto transition-all duration-300 ${expanded ? "w-full" : ""}`}>
        <Link
          href="/profile"
          className={`overflow-hidden border border-slate-200 p-0.5 flex items-center bg-slate-50 text-slate-700 font-medium text-sm transition-all duration-200 ease-out hover:border-primary/40 hover:bg-primary/5 hover:text-primary ${expanded ? "w-full h-11 px-2 rounded-xl justify-start gap-2.5" : "w-10 h-10 rounded-full justify-center"}`}
          title="Profile"
        >
          <span className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </span>
          {expanded && (
            <span className="text-sm text-slate-800 truncate pr-1">{user?.name ?? "Profile"}</span>
          )}
        </Link>
      </div>
    </aside>
  );
}
