"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type ReviewPYQ = {
  id: string;
  question: string;
  difficulty: string;
  category: string;
  confidenceScore: number;
  reviewStatus: string;
  sourceType: string;
  sourceUrl?: string | null;
  reviewNotes?: string | null;
  company: { id: string; name: string; shortName: string };
};

const statusOptions = ["pending", "approved", "needs_changes", "rejected"];

export default function AdminPyqReviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState<ReviewPYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        if (data.user.role !== "admin") {
          router.push("/dashboard");
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.push("/dashboard"));
  }, [router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    setLoading(true);
    fetch(`/api/admin/pyqs/review?status=${status}&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, user]);

  const takeAction = async (
    pyq: ReviewPYQ,
    action: "approve" | "reject" | "needs_changes"
  ) => {
    setSavingId(pyq.id);
    const response = await fetch("/api/admin/pyqs/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pyqId: pyq.id,
        action,
        reviewNotes: notes[pyq.id] ?? pyq.reviewNotes ?? null,
        confidenceScore: pyq.confidenceScore,
      }),
    });

    if (response.ok) {
      setItems((prev) => prev.filter((item) => item.id !== pyq.id));
    }
    setSavingId(null);
  };

  if (!user || user.role !== "admin") {
    return <div className="p-8 lg:p-10 text-slate-400">Checking admin access...</div>;
  }

  return (
    <div className="p-8 lg:p-10 max-w-6xl">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">● Admin</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">PYQ Review Queue</h1>
        <p className="text-slate-400 text-sm">Review, approve, or reject questions before they impact ranking.</p>
      </div>

      <div className="bg-card-dark border border-white/5 rounded-2xl p-4 mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-300">Logged in as {user.email}</p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
        >
          {statusOptions.map((s) => (
            <option value={s} key={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-card-dark border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center text-slate-400 text-sm">No questions found for status: {status}</div>
      ) : (
        <div className="space-y-3">
          {items.map((pyq) => (
            <div key={pyq.id} className="bg-card-dark border border-white/5 rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2 text-[11px] text-slate-500">
                <span>{pyq.company.name}</span>
                <span>•</span>
                <span>{pyq.category}</span>
                <span>•</span>
                <span>{pyq.difficulty}</span>
                <span>•</span>
                <span>confidence {(pyq.confidenceScore * 100).toFixed(0)}%</span>
                <span>•</span>
                <span>{pyq.sourceType}</span>
              </div>
              <p className="text-sm text-slate-200 mb-3">{pyq.question}</p>

              <textarea
                value={notes[pyq.id] ?? pyq.reviewNotes ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [pyq.id]: e.target.value }))}
                placeholder="Review notes (optional)"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none mb-3"
                rows={2}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => takeAction(pyq, "approve")}
                  disabled={savingId === pyq.id}
                  className="px-3 py-1.5 rounded-lg text-xs border border-green-400/30 text-green-400 bg-green-400/10 hover:bg-green-400/20 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  onClick={() => takeAction(pyq, "needs_changes")}
                  disabled={savingId === pyq.id}
                  className="px-3 py-1.5 rounded-lg text-xs border border-yellow-400/30 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 disabled:opacity-60"
                >
                  Needs Changes
                </button>
                <button
                  onClick={() => takeAction(pyq, "reject")}
                  disabled={savingId === pyq.id}
                  className="px-3 py-1.5 rounded-lg text-xs border border-pink-400/30 text-pink-400 bg-pink-400/10 hover:bg-pink-400/20 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
