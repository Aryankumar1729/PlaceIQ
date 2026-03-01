"use client";

import { useState, useEffect, useRef } from "react";
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
  Offer: "text-green-400 border-green-400/30 bg-green-400/10",
  Interview: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  OA: "text-primary border-primary/30 bg-primary/10",
  Applied: "text-slate-400 border-white/10 bg-white/5",
  Rejected: "text-pink-400 border-pink-400/30 bg-pink-400/10",
};

const statusDot: Record<string, string> = {
  Offer: "bg-green-400 shadow-[0_0_8px_#4ade80]",
  Interview: "bg-yellow-400 shadow-[0_0_8px_#facc15]",
  OA: "bg-primary shadow-[0_0_8px_#6366f1]",
  Applied: "bg-slate-500",
  Rejected: "bg-pink-400 shadow-[0_0_8px_#f472b6]",
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
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const statusBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const toggleStatusDropdown = (id: string) => {
    if (openStatusId === id) { setOpenStatusId(null); setDropdownPos(null); return; }
    const btn = statusBtnRefs.current[id];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.right - 144 }); // 144 = w-36
    }
    setOpenStatusId(id);
  };

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
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
          ● Job Tracker
        </p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">
              Your <span className="text-gradient">applications</span>
            </h1>
            <p className="text-slate-400 text-[15px]">
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
            <p className={`font-display font-bold text-xl ${
              s.label === "Offer" ? "text-green-400" :
              s.label === "Rejected" ? "text-pink-400" :
              s.label === "Interview" ? "text-yellow-400" :
              s.label === "OA" ? "text-primary" : "text-slate-100"
            }`}>
              {s.count}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-6 mb-6 border-primary/20 animate-fade-up">
          <p className="font-display font-bold text-sm mb-4">New Application</p>
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
              className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-slate-100 transition-all"
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
              <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center text-slate-400 animate-fade-up">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm mb-1">No applications yet.</p>
          <p className="text-xs text-slate-600">Click "Add Application" to start tracking.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 stagger">
          {applications.map((app) => (
            <div
              key={app.id}
              className="card p-5 animate-fade-up hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[app.status] ?? "bg-slate-500"}`} />
                  <div>
                    <p className="font-display font-bold text-sm">{app.companyName}</p>
                    <p className="text-xs text-slate-400">
                      {app.role} {app.ctc ? `· ${app.ctc}` : ""}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                  {/* Status dropdown — click to toggle */}
                  <div className="relative">
                    <button
                      ref={(el) => { statusBtnRefs.current[app.id] = el; }}
                      onClick={() => toggleStatusDropdown(app.id)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusStyle[app.status] ?? ""}`}
                    >
                      {app.status}
                      <ChevronDown size={10} className={`transition-transform ${openStatusId === app.id ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {/* Expand */}
                  <button
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-all"
                  >
                    <ChevronDown
                      size={13}
                      className={`transition-transform ${expandedId === app.id ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-pink-400 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === app.id && (
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-400 space-y-1.5 animate-fade-up">
                  <p>📅 Applied: {new Date(app.appliedDate).toLocaleDateString("en-IN")}</p>
                  {app.nextStep && <p>⏭ Next: {app.nextStep}</p>}
                  {app.notes && <p>📝 Notes: {app.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fixed-position status dropdown (renders above all cards) */}
      {openStatusId && dropdownPos && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => { setOpenStatusId(null); setDropdownPos(null); }} />
          <div
            className="fixed w-36 z-[100] rounded-xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ top: dropdownPos.top, left: dropdownPos.left, background: "#121216" }}
          >
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  handleStatusChange(openStatusId, s);
                  setOpenStatusId(null);
                  setDropdownPos(null);
                }}
                className={`w-full text-left px-3 py-2.5 text-xs transition-all hover:bg-white/5 ${
                  applications.find((a) => a.id === openStatusId)?.status === s
                    ? "text-slate-100 font-medium"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
