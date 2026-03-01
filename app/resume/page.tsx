"use client";

import { useState } from "react";
import ResumeHero from "@/components/ui/ResumeHero";
import ResumeUploader from "@/components/cards/ResumeUploader";

type ScoreResult = {
  overall: number;
  breakdown: { label: string; score: number; status: string }[];
  suggestions: string[];
};

const statusColor: Record<string, string> = {
  Strong: "#43e97b",
  Good: "#43e97b",
  Fair: "#f6d365",
  Weak: "#ff6584",
  "Needs Work": "#ff6584",
};

const ROLE_OPTIONS = [
  { value: "tech", label: "Tech / SDE", desc: "DSA, frameworks, coding projects" },
  { value: "non-tech", label: "Non-Tech / Biz", desc: "Consulting, finance, FMCG, management" },
  { value: "core", label: "Core Engg", desc: "Mechanical, electrical, civil, chemical" },
];

export default function ResumePage() {
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [roleType, setRoleType] = useState("tech");

  const overallColor = !result ? "" : result.overall >= 70 ? "text-green-400" : result.overall >= 50 ? "text-yellow-400" : "text-pink-400";

  return (
    <div className="p-8 lg:p-10 max-w-3xl">
      <ResumeHero />

      {/* Role type selector */}
      <div className="flex gap-3 mb-6">
        {ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setRoleType(opt.value); setResult(null); }}
            className={`flex-1 rounded-xl px-4 py-3 text-left transition-all border ${
              roleType === opt.value
                ? "border-primary/60 bg-primary/10"
                : "border-white/10 hover:border-white/20 bg-white/[0.02]"
            }`}
          >
            <p className={`font-display font-bold text-sm ${
              roleType === opt.value ? "text-primary" : "text-slate-300"
            }`}>{opt.label}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>

      <ResumeUploader roleType={roleType} onScore={(r, name) => { setResult(r); setFileName(name); }} />

      {/* Live score results */}
      {result && (
        <div className="space-y-4 animate-fade-up">
          {/* Overall score card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="font-display font-bold text-base">{fileName}</p>
              <p className={`font-display font-extrabold text-3xl ${overallColor}`}>
                {result.overall}<span className="text-base text-slate-500 font-normal">/100</span>
              </p>
            </div>

            {/* Breakdown bars */}
            <div className="flex flex-col gap-4">
              {result.breakdown.map((b) => {
                const color = statusColor[b.status] ?? "#6366f1";
                return (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">{b.label}</span>
                      <span style={{ color }}>{b.status} · {b.score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${b.score}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggestions */}
          <div className="card p-6">
            <p className="font-display font-bold text-sm mb-4">💡 Suggestions</p>
            <ul className="space-y-3">
              {result.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-primary mt-0.5 shrink-0">→</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
