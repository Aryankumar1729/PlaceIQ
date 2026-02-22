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
  Offer: "text-accent-green",
  Interview: "text-yellow-400",
  OA: "text-accent",
  Applied: "text-muted",
  Rejected: "text-accent-pink",
};

const statusDot: Record<string, string> = {
  Offer: "bg-accent-green shadow-[0_0_6px_#43e97b]",
  Interview: "bg-yellow-400 shadow-[0_0_6px_#facc15]",
  OA: "bg-accent shadow-[0_0_6px_#6c63ff]",
  Applied: "bg-muted",
  Rejected: "bg-accent-pink shadow-[0_0_6px_#ff6584]",
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
      });
  }, []);

  const stats = statusOptions.map((s) => ({
    label: s,
    count: applications.filter((a) => a.status === s).length,
  }));

  const recent = applications.slice(0, 3);

  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="h-4 bg-surface2 rounded w-1/3 mb-4" />
        <div className="h-12 bg-surface2 rounded-xl mb-3" />
        <div className="h-12 bg-surface2 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-syne font-bold text-sm">📋 Application Tracker</h2>
        <Link href="/tracker" className="text-xs text-accent hover:underline">
          View all →
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-6 text-muted">
          <p className="text-sm mb-1">No applications yet.</p>
          <p className="text-xs text-muted-2 mb-4">
            Start tracking your placement drives.
          </p>
          <Link
            href="/tracker"
            className="text-xs text-accent border border-accent/30 px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-all"
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
                className="bg-surface2 rounded-lg p-2 text-center"
              >
                <p className={`font-syne font-bold text-base ${
                  s.label === "Offer" ? "text-accent-green" :
                  s.label === "Rejected" ? "text-accent-pink" :
                  s.label === "Interview" ? "text-yellow-400" :
                  s.label === "OA" ? "text-accent" : "text-[var(--text)]"
                }`}>
                  {s.count}
                </p>
                <p className="text-[9px] text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent applications */}
          <div className="flex flex-col gap-2">
            {recent.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[app.status] ?? "bg-muted"}`} />
                  <div>
                    <p className="text-xs font-medium">{app.companyName}</p>
                    <p className="text-[10px] text-muted">{app.role}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold ${statusColor[app.status] ?? "text-muted"}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>

          {applications.length > 3 && (
            <Link
              href="/tracker"
              className="block text-center text-[10px] text-muted hover:text-accent mt-3 transition-colors"
            >
              +{applications.length - 3} more applications
            </Link>
          )}
        </>
      )}
    </div>
  );
}