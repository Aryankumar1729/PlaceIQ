import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format CTC
export function formatCTC(ctc: number): string {
  if (ctc >= 100) return `₹${(ctc / 100).toFixed(1)}Cr`;
  if (ctc >= 1) return `₹${ctc}L`;
  return `₹${(ctc * 100).toFixed(0)}k`;
}

// Difficulty badge color
export function getDifficultyColor(diff: "Easy" | "Medium" | "Hard"): string {
  return { Easy: "badge-easy", Medium: "badge-medium", Hard: "badge-hard" }[diff];
}

// Status dot color
export function getStatusColor(status: string): string {
  return (
    {
      offer: "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]",
      interview: "bg-yellow-400",
      applied: "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]",
      rejected: "bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.5)]",
    }[status] ?? "bg-slate-500"
  );
}

// Relative time
export function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
