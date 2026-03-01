"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Application = {
  id: string;
  companyName: string;
  role: string;
  status: string;
  appliedDate: string;
};

const statusColor: Record<string, string> = {
  Offer: "text-green-400",
  Interview: "text-yellow-400",
  OA: "text-primary",
  Applied: "text-slate-400",
  Rejected: "text-pink-400",
};

const statusDot: Record<string, string> = {
  Offer: "bg-green-500 shadow-[0_0_6px_#22c55e]",
  Interview: "bg-yellow-400 shadow-[0_0_6px_#facc15]",
  OA: "bg-primary shadow-[0_0_6px_#6366f1]",
  Applied: "bg-slate-500",
  Rejected: "bg-pink-500 shadow-[0_0_6px_#ec4899]",
};

const statusOptions = ["Applied", "OA", "Interview", "Offer", "Rejected"];

export default function TrackerSummary() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = statusOptions.map((s) => ({
    label: s,
    count: applications.filter((a) => a.status === s).length,
  }));

  const recent = applications.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-card-dark border border-white/5 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
        <div className="h-12 bg-white/5 rounded-xl mb-3" />
        <div className="h-12 bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-sm text-white">Application Tracker</h2>
        <Link href="/tracker" className="text-xs text-primary hover:underline">
          View all →
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-slate-400 mb-1">No applications yet.</p>
          <p className="text-xs text-slate-600 mb-4">
            Start tracking your placement drives.
          </p>
          <Link
            href="/tracker"
            className="text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-xl hover:bg-primary/10 transition-all"
          >
            + Add Application
          </Link>
        </div>
      ) : (
        <>
          {/* Stats pills */}
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 rounded-xl p-2 text-center"
              >
                <p className={`font-display font-bold text-base ${
                  s.label === "Offer" ? "text-green-400" :
                  s.label === "Rejected" ? "text-pink-400" :
                  s.label === "Interview" ? "text-yellow-400" :
                  s.label === "OA" ? "text-primary" : "text-white"
                }`}>
                  {s.count}
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent */}
          <div className="flex flex-col gap-2">
            {recent.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[app.status] ?? "bg-slate-500"}`} />
                  <div>
                    <p className="text-xs font-medium text-white">{app.companyName}</p>
                    <p className="text-[10px] text-slate-500">{app.role}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold ${statusColor[app.status] ?? "text-slate-500"}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>

          {applications.length > 3 && (
            <Link
              href="/tracker"
              className="block text-center text-[10px] text-slate-500 hover:text-primary mt-3 transition-colors"
            >
              +{applications.length - 3} more applications
            </Link>
          )}
        </>
      )}
    </div>
  );
}