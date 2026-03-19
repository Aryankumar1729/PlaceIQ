"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PlanPyq = {
  pyqId: string;
  question: string;
  difficulty: string;
  category: string;
  companyName: string;
};

type MockTest = {
  id: string;
  title: string;
  durationMinutes: number;
  focus: string;
  schedule: string;
};

type ResumeTask = {
  id: string;
  title: string;
  detail: string;
  estimatedMinutes: number;
};

type WeeklyPlan = {
  days: number;
  summary: string;
  pyqs: PlanPyq[];
  mockTests: MockTest[];
  resumeTask: ResumeTask | null;
};

const difficultyClass: Record<string, string> = {
  Easy: "text-green-400",
  Medium: "text-yellow-400",
  Hard: "text-pink-400",
};

export default function WeeklyPlanCard() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/weekly-plan?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        setPlan(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <div className="bg-card-dark border border-white/5 rounded-2xl p-6 animate-pulse">
        <div className="h-5 bg-white/5 rounded w-1/4 mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-white/5 rounded-xl mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-bold text-base text-white">Weekly Plan Engine</h2>
          <p className="text-xs text-slate-500 mt-1">One focused plan for this week&apos;s prep execution.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider">Window</span>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
          </select>
        </div>
      </div>

      {!plan || plan.pyqs.length === 0 ? (
        <p className="text-sm text-slate-400">Add prep targets to generate your plan.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <p className="text-xs text-slate-400 mb-4">{plan.summary}</p>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">PYQ Queue</p>
                <p className="text-[11px] text-slate-500">{plan.pyqs.length} tasks</p>
              </div>
              <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-2">
                {plan.pyqs.map((item, index) => (
                  <Link
                    key={item.pyqId}
                    href={`/prep?company=${encodeURIComponent(item.companyName)}&search=${encodeURIComponent(item.question.slice(0, 30))}`}
                    className="bg-card-dark rounded-lg p-3 border border-white/5 hover:border-primary/30 transition-colors"
                  >
                    <p className="text-[11px] text-slate-500 mb-1">#{index + 1} · {item.companyName}</p>
                    <p className="text-sm text-slate-200 line-clamp-2">{item.question}</p>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {item.category} · <span className={difficultyClass[item.difficulty] ?? "text-slate-300"}>{item.difficulty}</span>
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 lg:sticky lg:top-4 h-fit">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 mb-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Mock Tests</p>
              <div className="flex flex-col gap-2">
                {plan.mockTests.map((mock) => (
                  <div key={mock.id} className="bg-card-dark rounded-lg p-3 border border-white/5">
                    <p className="text-sm font-semibold text-white mb-1">{mock.title}</p>
                    <p className="text-[11px] text-slate-400">{mock.focus}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{mock.durationMinutes} min · {mock.schedule}</p>
                  </div>
                ))}
              </div>
            </div>

            {plan.resumeTask && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wider text-primary mb-1">Resume Task</p>
                <p className="text-sm text-slate-200">{plan.resumeTask.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">{plan.resumeTask.detail}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
