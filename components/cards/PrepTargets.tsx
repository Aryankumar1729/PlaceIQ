"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

type Target = {
  id: string;
  companyId: string;
  done: number;
  total: number;
  company: {
    id: string;
    name: string;
    shortName: string;
    baseCTC: number;
  };
};

export default function PrepTargets() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prep-targets")
      .then((r) => r.json())
      .then((data) => { setTargets(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const removeTarget = async (companyId: string) => {
    await fetch("/api/prep-targets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });
    setTargets((prev) => prev.filter((t) => t.companyId !== companyId));
  };

  if (loading) {
    return (
      <div className="bg-card-dark border border-white/5 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
        {[1, 2].map((i) => (
          <div key={i} className="h-14 bg-white/5 rounded-xl mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-sm text-white">Active Prep Targets</h2>
        <Link
          href="/companies"
          className="text-xs text-primary hover:underline"
        >
          + Add Target
        </Link>
      </div>

      {targets.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-slate-400 mb-1">No prep targets yet.</p>
          <p className="text-xs text-slate-600">
            Go to a company page and click "Start Prep" to add one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {targets.map((t) => {
            const pct = t.total > 0 ? Math.round((t.done / t.total) * 100) : 0;
            return (
              <div key={t.id} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-display font-bold text-[10px] text-primary">
                      {t.company.shortName.slice(0, 3)}
                    </div>
                    <div>
                      <p className="font-display font-bold text-xs text-white">{t.company.name}</p>
                      <p className="text-[10px] text-slate-500">{t.done}/{t.total} questions · {pct}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/prep?company=${encodeURIComponent(t.company.name)}`}
                      className="text-[10px] text-primary border border-primary/30 px-2 py-1 rounded-xl hover:bg-primary/10 transition-all"
                    >
                      Continue →
                    </Link>
                    <button
                      onClick={() => removeTarget(t.companyId)}
                      className="text-slate-500 hover:text-pink-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: pct === 100 ? "#22c55e" : pct > 50 ? "#6366f1" : "#ec4899",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
