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
      .then((data) => { setTargets(data); setLoading(false); });
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
      <div className="card p-5 animate-pulse">
        <div className="h-4 bg-surface2 rounded w-1/3 mb-4" />
        {[1, 2].map((i) => (
          <div key={i} className="h-14 bg-surface2 rounded-xl mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-syne font-bold text-sm">🎯 Active Prep Targets</h2>
        <Link
          href="/companies"
          className="text-xs text-accent hover:underline"
        >
          + Add Target
        </Link>
      </div>

      {targets.length === 0 ? (
        <div className="text-center py-6 text-muted">
          <p className="text-sm mb-1">No prep targets yet.</p>
          <p className="text-xs text-muted-2">
            Go to a company page and click "Start Prep" to add one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {targets.map((t) => {
            const pct = t.total > 0 ? Math.round((t.done / t.total) * 100) : 0;
            return (
              <div key={t.id} className="bg-surface2 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center font-syne font-bold text-[10px] text-accent">
                      {t.company.shortName.slice(0, 3)}
                    </div>
                    <div>
                      <p className="font-syne font-bold text-xs">{t.company.name}</p>
                      <p className="text-[10px] text-muted">{t.done}/{t.total} questions · {pct}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/prep?company=${encodeURIComponent(t.company.name)}`}
                      className="text-[10px] text-accent border border-accent/30 px-2 py-1 rounded-lg hover:bg-accent/10 transition-all"
                    >
                      Continue →
                    </Link>
                    <button
                      onClick={() => removeTarget(t.companyId)}
                      className="text-muted hover:text-accent-pink transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: pct === 100
                        ? "var(--accent-green)"
                        : pct > 50
                        ? "var(--accent)"
                        : "var(--accent-pink)",
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
