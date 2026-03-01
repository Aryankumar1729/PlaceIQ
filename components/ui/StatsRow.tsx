"use client";

import { useState, useEffect } from "react";

type Stats = {
  companies: number;
  pyqs: number;
  users: number;
  prepScore: string;
};

export default function StatsRow() {
  const [stats, setStats] = useState<Stats>({
    companies: 0, pyqs: 0, users: 0, prepScore: "—"
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const rows = [
    { label: "Companies Tracked", value: stats.companies.toString(), sub: "Updated weekly", color: "text-white" },
    { label: "PYQs Collected", value: stats.pyqs > 999 ? `${(stats.pyqs / 1000).toFixed(1)}k` : stats.pyqs.toString(), sub: "Verified from open sources", color: "text-green-500" },
    { label: "Students Joined", value: stats.users.toString(), sub: "And growing", color: "text-primary" },
    { label: "Your Prep Score", value: stats.prepScore ?? "—", sub: stats.prepScore === "—" ? "Complete profile" : "Across your targets", color: "text-slate-600" },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
      {rows.map((s) => (
        <div key={s.label} className="text-center md:text-left">
          <p className="stat-label">{s.label}</p>
          <h2 className={`text-5xl font-display font-bold mb-2 ${s.color}`}>
            {s.value}
          </h2>
          <p className="text-sm text-slate-400">{s.sub}</p>
        </div>
      ))}
    </section>
  );
}