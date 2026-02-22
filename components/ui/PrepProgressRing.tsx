"use client";

import { useEffect, useState } from "react";

type Props = {
  companyId: string;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
};

type Progress = {
  ids: string[];
  easy: number;
  medium: number;
  hard: number;
};

export default function PrepProgressRing({
  companyId,
  totalEasy,
  totalMedium,
  totalHard,
}: Props) {
  const [progress, setProgress] = useState<Progress>({
    ids: [], easy: 0, medium: 0, hard: 0,
  });

  const total = totalEasy + totalMedium + totalHard;
  const done = progress.easy + progress.medium + progress.hard;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  useEffect(() => {
    if (!companyId) return;
    fetch(`/api/progress?companyId=${companyId}&breakdown=true`)
      .then((r) => r.json())
      .then((data) => setProgress(data));
  }, [companyId]);

  // SVG ring
  const size = 80;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="card p-5 mb-4">
      <div className="flex items-center gap-6">
        {/* Ring */}
        <div className="relative shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--surface2)"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={pct === 100 ? "var(--accent-green)" : "var(--accent)"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-syne font-extrabold text-base leading-none">{pct}%</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-syne font-bold text-sm">Overall Progress</p>
            <p className="text-xs text-muted">{done}/{total}</p>
          </div>

          <div className="flex flex-col gap-1.5 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-green" />
                <span className="text-xs text-muted">Easy</span>
              </div>
              <span className="text-xs font-medium">
                <span className="text-accent-green">{progress.easy}</span>
                <span className="text-muted">/{totalEasy}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-xs text-muted">Medium</span>
              </div>
              <span className="text-xs font-medium">
                <span className="text-yellow-400">{progress.medium}</span>
                <span className="text-muted">/{totalMedium}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-pink" />
                <span className="text-xs text-muted">Hard</span>
              </div>
              <span className="text-xs font-medium">
                <span className="text-accent-pink">{progress.hard}</span>
                <span className="text-muted">/{totalHard}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}