"use client";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  BarChart3,
  FileText,
  Users,
} from "lucide-react";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companies", label: "Companies", icon: Building2, badge: "248" },
  { href: "/prep", label: "Interview Prep", icon: ClipboardList },
  { href: "/tracker", label: "Job Tracker", icon: BarChart3 },
];

const collegeLinks = [
  { href: "/resume", label: "Resume Score", icon: FileText },
  { href: "/alumni", label: "Alumni Network", icon: Users, badge: "New" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border px-4 py-6 gap-1 shrink-0 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
      {/* Main nav */}
      <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted-2 px-3 py-2">
        Explore
      </p>
      {mainLinks.map(({ href, label, icon: Icon, badge }) => (
        <Link
          key={href}
          href={href}
          className={`sidebar-item ${pathname.startsWith(href) ? "active" : ""}`}
        >
          <Icon size={17} className="shrink-0 opacity-70" />
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="badge bg-accent/15 text-accent border border-accent/20 text-[10px] px-2 py-0.5 rounded-full font-semibold">
              {badge}
            </span>
          )}
        </Link>
      ))}

      {/* College nav */}
      <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted-2 px-3 py-2 mt-3">
        Your College
      </p>
      {collegeLinks.map(({ href, label, icon: Icon, badge }) => (
        <Link
          key={href}
          href={href}
          className={`sidebar-item ${pathname.startsWith(href) ? "active" : ""}`}
        >
          <Icon size={17} className="shrink-0 opacity-70" />
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="badge bg-accent-green/15 text-accent-green border border-accent-green/20 text-[10px] px-2 py-0.5 rounded-full font-semibold">
              {badge}
            </span>
          )}
        </Link>
      ))}
      {/* Contribute Form */}
      <div className="mt-6">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-2 mb-2 px-3">
          Contribute
        </p>
        <Link
          href="/submit"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${pathname === "/submit"
              ? "bg-surface2 text-[var(--text)]"
              : "text-muted hover:text-[var(--text)] hover:bg-surface2"
            }`}
        >
          <PlusCircle size={16} />
          Submit Question
        </Link>
      </div>


      {/* Drive alert */}
      <div className="mt-auto mx-1 p-3 rounded-xl bg-accent/8 border border-accent/15">
        <p className="text-xs font-semibold mb-1">Drive season approaching</p>
        <p className="text-[11px] text-muted leading-relaxed">
          TCS, Infosys drives in 3 weeks. 12 companies visiting your campus.
        </p>
      </div>
    </aside>
  );
}
