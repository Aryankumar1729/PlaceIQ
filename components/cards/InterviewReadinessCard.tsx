"use client";

import { useEffect, useState } from "react";

type Area = {
  key: "dsa" | "core" | "resume" | "mock";
  label: string;
  score: number;
  action: string;
};

type WeakArea = {
  label: string;
  score: number;
  action: string;
};

type ReadinessPayload = {
  overall: number;
  areas: Area[];
  weakAreas: WeakArea[];
  insight: string;
};

const barColor = (score: number) => {
  if (score >= 75) return "bg-green-400";
  if (score >= 55) return "bg-yellow-400";
  return "bg-pink-400";
};

export default function InterviewReadinessCard() {
  const [data, setData] = useState<ReadinessPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/readiness")
      .then((r) => r.json())
      .then((payload) => {
        setData(payload);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card-dark border border-white/5 rounded-2xl p-6 animate-pulse">
        <div className="h-5 bg-white/5 rounded w-1/3 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-white/5 rounded mb-2" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-card-dark border border-white/5 rounded-2xl p-6">
        <h2 className="font-display font-bold text-sm text-white mb-2">Interview Readiness</h2>
        <p className="text-sm text-slate-400">Couldn&apos;t load readiness score right now.</p>
      </div>
    );
  }

  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
        <div>
          <h2 className="font-display font-bold text-base text-white">Interview Readiness</h2>
          <p className="text-xs text-slate-500 mt-1">Single score across DSA, core, resume, and mock practice.</p>
        </div>
        <p className="font-display text-4xl font-extrabold text-primary leading-none">{data.overall}</p>
      </div>
      <p className="text-xs text-slate-400 mb-4">{data.insight}</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white/5 border border-white/5 rounded-xl p-3">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Readiness Breakdown</p>
          <div className="max-h-[240px] overflow-y-auto pr-1 flex flex-col gap-3">
            {data.areas.map((area) => (
              <div key={area.key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">{area.label}</span>
                  <span className="text-slate-500">{area.score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-card-dark overflow-hidden">
                  <div className={`${barColor(area.score)} h-full rounded-full`} style={{ width: `${area.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Weak-area actions</p>
          <div className="max-h-[240px] overflow-y-auto pr-1 flex flex-col gap-2">
            {data.weakAreas.map((area) => (
              <div key={area.label} className="bg-card-dark rounded-lg border border-white/5 p-2.5">
                <p className="text-xs text-white">{area.label} ({area.score}%)</p>
                <p className="text-[11px] text-slate-400 mt-1">{area.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-3">
        <p className="text-[11px] uppercase tracking-wider text-primary mb-1">Focus for next 7 days</p>
        {data.weakAreas[0] ? (
          <p className="text-sm text-slate-200">{data.weakAreas[0].action}</p>
        ) : (
          <p className="text-sm text-slate-200">Maintain your routine and review one mock this week.</p>
        )}
      </div>
    </div>
  );
}
