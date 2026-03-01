"use client";

import { useState } from "react";

type Status = "offer" | "interview" | "applied" | "rejected";

type Application = {
  company: string;
  role: string;
  note: string;
  date: string;
  status: Status;
};

const apps: Application[] = [
  { company: "TCS", role: "Systems Engineer · ₹3.6 LPA", note: "Offer Received 🎉", date: "Jan 15", status: "offer" },
  { company: "Infosys", role: "Specialist Programmer · Feb 22", note: "Round 2 Scheduled", date: "Feb 10", status: "interview" },
  { company: "Wipro", role: "Project Engineer · Pending result", note: "Technical Interview", date: "Feb 8", status: "interview" },
  { company: "Amazon", role: "SDE-1 · Off-campus", note: "Applied", date: "Feb 1", status: "applied" },
  { company: "Capgemini", role: "Analyst · After Aptitude round", note: "Not Selected", date: "Jan 28", status: "rejected" },
];

const statusConfig: Record<Status, { color: string; glow: string; label: string }> = {
  offer: { color: "bg-green-400", glow: "shadow-[0_0_8px_rgba(74,222,128,0.5)]", label: "Offer" },
  interview: { color: "bg-yellow-400", glow: "shadow-[0_0_8px_rgba(250,204,21,0.5)]", label: "Interview" },
  applied: { color: "bg-primary", glow: "shadow-[0_0_8px_rgba(99,102,241,0.5)]", label: "Applied" },
  rejected: { color: "bg-pink-400", glow: "shadow-[0_0_8px_rgba(244,114,182,0.5)]", label: "Rejected" },
};

const summaryStats = [
  { label: "Applied", value: 8, color: "text-primary" },
  { label: "Interviews", value: 3, color: "text-yellow-400" },
  { label: "Offers", value: 1, color: "text-green-400" },
  { label: "Rejected", value: 2, color: "text-pink-400" },
];

export default function ApplicationList() {
  const [applications] = useState(apps);

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-8 stagger">
        {summaryStats.map((s) => (
          <div key={s.label} className="card text-center animate-fade-up p-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">{s.label}</p>
            <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold">Applications</h2>
        <button className="btn-primary text-xs py-2 px-4">+ Add Application</button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2 stagger">
        {applications.map((app, i) => {
          const cfg = statusConfig[app.status];
          return (
            <div
              key={i}
              className="card flex items-center gap-4 px-4 py-3.5 hover:translate-x-1 cursor-pointer animate-fade-up"
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.color} ${cfg.glow}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {app.company} — {app.note}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{app.role}</p>
              </div>
              <span className="text-xs text-slate-600 shrink-0">{app.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
