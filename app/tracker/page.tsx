"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";

type Application = {
  id: string;
  companyName: string;
  role: string;
  status: string;
  ctc?: string;
  notes?: string;
  nextStep?: string;
  appliedDate: string;
};

const statusOptions = ["Applied", "OA", "Interview", "Offer", "Rejected"];

const statusStyle: Record<string, string> = {
  Offer: "text-accent-green border-accent-green/30 bg-accent-green/10",
  Interview: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  OA: "text-accent border-accent/30 bg-accent/10",
  Applied: "text-muted border-border bg-surface2",
  Rejected: "text-accent-pink border-accent-pink/30 bg-accent-pink/10",
};

const statusDot: Record<string, string> = {
  Offer: "bg-accent-green shadow-[0_0_8px_#43e97b]",
  Interview: "bg-yellow-400 shadow-[0_0_8px_#facc15]",
  OA: "bg-accent shadow-[0_0_8px_#6c63ff]",
  Applied: "bg-muted",
  Rejected: "bg-accent-pink shadow-[0_0_8px_#ff6584]",
};

const emptyForm = {
  companyName: "", role: "", status: "Applied", ctc: "", notes: "", nextStep: "",
};

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((data) => { setApplications(data); setLoading(false); });
  }, []);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.companyName || !form.role) return;
    setSaving(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setApplications((prev) => [data, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const stats = statusOptions.map((s) => ({
    label: s,
    count: applications.filter((a) => a.status === s).length,
  }));

  return (
    <div className="p-8 lg:p-10 max-w-4xl">
      {/* Hero */}
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
          ● Job Tracker
        </p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-2">
              Your <span className="text-gradient">applications</span>
            </h1>
            <p className="text-muted text-[15px]">
              Track every drive, OA, and interview in one place.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            <Plus size={16} />
            Add Application
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3 mb-8 animate-fade-up">
        {stats.map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <p className={`font-syne font-bold text-xl ${
              s.label === "Offer" ? "text-accent-green" :
              s.label === "Rejected" ? "text-accent-pink" :
              s.label === "Interview" ? "text-yellow-400" :
              s.label === "OA" ? "text-accent" : "text-[var(--text)]"
            }`}>
              {s.count}
            </p>
            <p className="text-[10px] text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-6 mb-6 border-accent/20 animate-fade-up">
          <p className="font-syne font-bold text-sm mb-4">New Application</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              className="input-field"
              placeholder="Company name *"
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
            />
            <input
              className="input-field"
              placeholder="Role (e.g. SDE-1) *"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            />
            <input
              className="input-field"
              placeholder="CTC (e.g. 18L)"
              value={form.ctc}
              onChange={(e) => update("ctc", e.target.value)}
            />
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <input
            className="input-field w-full mb-3"
            placeholder="Next step (e.g. Technical round on Feb 25)"
            value={form.nextStep}
            onChange={(e) => update("nextStep", e.target.value)}
          />
          <textarea
            className="input-field w-full resize-none"
            rows={2}
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={saving || !form.companyName || !form.role}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Application →"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-[var(--text)] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Applications list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-surface2 rounded w-1/3 mb-2" />
              <div className="h-3 bg-surface2 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center text-muted animate-fade-up">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm mb-1">No applications yet.</p>
          <p className="text-xs text-muted-2">Click "Add Application" to start tracking.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 stagger">
          {applications.map((app) => (
            <div
              key={app.id}
              className="card p-5 animate-fade-up hover:border-border-2 transition-all"
            >
              <div className="flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[app.status] ?? "bg-muted"}`} />
                  <div>
                    <p className="font-syne font-bold text-sm">{app.companyName}</p>
                    <p className="text-xs text-muted">
                      {app.role} {app.ctc ? `· ${app.ctc}` : ""}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                  {/* Status dropdown with hover bridge */}
                  <div className="relative group">
                    <button
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusStyle[app.status] ?? ""}`}
                    >
                      {app.status}
                      <ChevronDown size={10} />
                    </button>

                    {/* pt-2 = invisible bridge between button and dropdown */}
                    <div className="absolute right-0 top-6 pt-2 w-36 z-20 hidden group-hover:block">
                      <div
                        className="rounded-xl border border-border-2 shadow-card overflow-hidden"
                        style={{ background: "var(--surface)" }}
                      >
                        {statusOptions.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(app.id, s)}
                            className={`w-full text-left px-3 py-2.5 text-xs transition-all hover:bg-surface2 ${
                              app.status === s
                                ? "text-[var(--text)] font-medium"
                                : "text-muted hover:text-[var(--text)]"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expand */}
                  <button
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    className="w-7 h-7 rounded-lg bg-surface2 border border-border flex items-center justify-center text-muted hover:text-[var(--text)] transition-all"
                  >
                    <ChevronDown
                      size={13}
                      className={`transition-transform ${expandedId === app.id ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="w-7 h-7 rounded-lg bg-surface2 border border-border flex items-center justify-center text-muted hover:text-accent-pink transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === app.id && (
                <div className="mt-4 pt-4 border-t border-border text-xs text-muted space-y-1.5 animate-fade-up">
                  <p>📅 Applied: {new Date(app.appliedDate).toLocaleDateString("en-IN")}</p>
                  {app.nextStep && <p>⏭ Next: {app.nextStep}</p>}
                  {app.notes && <p>📝 Notes: {app.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
