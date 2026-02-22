"use client";

import { useEffect, useState } from "react";

type User = {
  name: string;
  college?: string;
  branch?: string;
  gradYear?: number;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getMotivation(hour: number) {
  if (hour < 12) return "Start your day with one prep target. 💪";
  if (hour < 17) return "Placement season waits for no one. Keep going. 🎯";
  return "Evening grind hits different. You've got this. 🔥";
}

export default function DashboardGreeting() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user));
  }, []);

  if (!user) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-surface2 rounded w-64 mb-2" />
        <div className="h-4 bg-surface2 rounded w-40" />
      </div>
    );
  }

  const hour = new Date().getHours();
  const firstName = user.name?.split(" ")[0];

  return (
    <div className="mb-8 animate-fade-up">
      <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
        ● {getGreeting()}
      </p>
      <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-2">
        Hey, <span className="text-gradient">{firstName}</span> 👋
      </h1>

      {/* College info row */}
      <div className="flex items-center flex-wrap gap-2 mb-3">
        {user.college && (
          <span className="text-xs px-3 py-1 rounded-full bg-surface2 border border-border text-muted">
            🏫 {user.college}
          </span>
        )}
        {user.branch && (
          <span className="text-xs px-3 py-1 rounded-full bg-surface2 border border-border text-muted">
            💻 {user.branch}
          </span>
        )}
        {user.gradYear && (
          <span className="text-xs px-3 py-1 rounded-full bg-surface2 border border-border text-muted">
            🎓 Class of {user.gradYear}
          </span>
        )}
      </div>

      <p className="text-muted text-[15px]">{getMotivation(hour)}</p>
    </div>
  );
}