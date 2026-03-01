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
        const withProgress = targets
          .filter((t) => t.total > 0)
          .sort((a, b) => (a.done / a.total) - (b.done / b.total));
        setTarget(withProgress[0] ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card-dark border border-white/5 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/2 mb-3" />
        <div className="h-8 bg-white/5 rounded w-3/4" />
      </div>
    );
  }

  if (!target) {
    return (
      <div className="bg-card-dark border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-primary" />
          <p className="font-display font-bold text-sm text-white">Suggested Next Step</p>
        </div>
        <p className="text-sm text-slate-400">
          Add a prep target to get personalized suggestions.
        </p>
        <Link href="/companies" className="text-xs text-primary hover:underline mt-2 block">
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
    <div className="bg-card-dark border border-primary/20 rounded-2xl p-5"
      style={{ boxShadow: "0 0 20px rgba(99,102,241,0.06)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-primary" />
        <p className="font-display font-bold text-sm text-white">Suggested Next Step</p>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-display font-bold text-xs text-primary shrink-0">
          {target.company.shortName.slice(0, 3)}
        </div>
        <div>
          <p className="font-display font-bold text-sm text-white">{target.company.name}</p>
          <p className="text-[11px] text-slate-500">{target.done}/{target.total} done · {pct}%</p>
        </div>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct > 50 ? "#22c55e" : "#6366f1",
          }}
        />
      </div>

      <p className="text-xs text-slate-400 mb-4">{getMessage()}</p>

      <Link
        href={`/prep?company=${encodeURIComponent(target.company.name)}`}
        className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
      >
        Continue Prep →
      </Link>
    </div>
  );
}