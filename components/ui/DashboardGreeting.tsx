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

export default function DashboardGreeting() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="mb-6 animate-pulse">
        <div className="h-5 bg-white/5 rounded w-48 mb-3" />
        <div className="h-4 bg-white/5 rounded w-32" />
      </div>
    );
  }

  const firstName = user.name?.split(" ")[0];

  return (
    <div className="mb-4 animate-fade-up">
      <p className="text-sm text-slate-500">
        {getGreeting()}, <span className="text-white font-medium">{firstName}</span>
      </p>
    </div>
  );
}