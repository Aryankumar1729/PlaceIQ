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
      .then((data) => setStats(data));
  }, []);

  const rows = [
    { label: "COMPANIES TRACKED", value: stats.companies.toString(), sub: "Updated weekly", color: "text-accent" },
    { label: "PYQS COLLECTED", value: stats.pyqs > 999 ? `${(stats.pyqs / 1000).toFixed(1)}k` : stats.pyqs.toString(), sub: "Verified from open sources", color: "text-accent-green" },
    { label: "STUDENTS JOINED", value: stats.users.toString(), sub: "And growing", color: "text-accent-pink" },
    { label: "YOUR PREP SCORE", value: stats.prepScore ?? "—", sub: stats.prepScore === "—" ? "Add a prep target" : "Across your targets", color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {rows.map((s) => (
        <div key={s.label} className="stat-card">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-2 mb-2">
            {s.label}
          </p>
          <p className={`font-syne font-extrabold text-3xl mb-1 ${s.color}`}>
            {s.value}
          </p>
          <p className="text-[11px] text-muted">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}