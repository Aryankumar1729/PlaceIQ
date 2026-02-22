"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

type Target = {
  companyId: string;
  done: number;
  total: number;
  company: { name: string; shortName: string };
};

export default function SuggestedNextStep() {
  const [target, setTarget] = useState<Target | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prep-targets")
      .then((r) => r.json())
      .then((targets: Target[]) => {
        if (!targets.length) { setLoading(false); return; }

        // Find target with lowest progress % but has questions remaining
        const withProgress = targets
          .filter((t) => t.total > 0)
          .sort((a, b) => {
            const pctA = a.done / a.total;
            const pctB = b.done / b.total;
            return pctA - pctB;
          });

        setTarget(withProgress[0] ?? null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="h-4 bg-surface2 rounded w-1/2 mb-3" />
        <div className="h-8 bg-surface2 rounded w-3/4" />
      </div>
    );
  }

  if (!target) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-accent" />
          <p className="font-syne font-bold text-sm">Suggested Next Step</p>
        </div>
        <p className="text-sm text-muted">
          Add a prep target to get personalized suggestions.
        </p>
        <Link href="/companies" className="text-xs text-accent hover:underline mt-2 block">
          Browse companies →
        </Link>
      </div>
    );
  }

  const pct = Math.round((target.done / target.total) * 100);
  const remaining = target.total - target.done;

  const getMessage = () => {
    if (pct === 0) return `You haven't started ${target.company.name} prep yet. Do 5 questions today.`;
    if (pct < 20) return `You're just getting started with ${target.company.name}. Push to 20% today.`;
    if (pct < 50) return `Good progress on ${target.company.name}! Keep the momentum going.`;
    return `Almost there on ${target.company.name}! ${remaining} questions left.`;
  };

  return (
    <div className="card p-5 border-accent/20"
      style={{ boxShadow: "0 0 20px rgba(108,99,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-accent" />
        <p className="font-syne font-bold text-sm">Suggested Next Step</p>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center font-syne font-bold text-xs text-accent shrink-0">
          {target.company.shortName.slice(0, 3)}
        </div>
        <div>
          <p className="font-syne font-bold text-sm">{target.company.name}</p>
          <p className="text-[11px] text-muted">{target.done}/{target.total} done · {pct}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface2 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct > 50 ? "var(--accent-green)" : "var(--accent)",
          }}
        />
      </div>

      <p className="text-xs text-muted mb-4">{getMessage()}</p>

      <Link
        href={`/prep?company=${encodeURIComponent(target.company.name)}`}
        className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
      >
        Continue Prep →
      </Link>
    </div>
  );
}