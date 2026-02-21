"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  college?: string;
  branch?: string;
  cgpa?: number;
  gradYear?: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    college: "",
    branch: "",
    cgpa: "",
    gradYear: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) { router.push("/login"); return; }
        setUser(data.user);
        setForm({
          name: data.user.name ?? "",
          college: data.user.college ?? "",
          branch: data.user.branch ?? "",
          cgpa: data.user.cgpa?.toString() ?? "",
          gradYear: data.user.gradYear?.toString() ?? "",
        });
        setLoading(false);
      });
  }, [router]);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/user/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        college: form.college,
        branch: form.branch,
        cgpa: form.cgpa ? parseFloat(form.cgpa) : null,
        gradYear: form.gradYear ? parseInt(form.gradYear) : null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-10 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface2 rounded w-1/3" />
          <div className="h-40 bg-surface2 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10 max-w-2xl">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
          ● Your Profile
        </p>
        <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-2">
          Hey, <span className="text-gradient">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-muted text-[15px]">
          Manage your profile and placement details.
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm animate-fade-up">
          ✅ Profile updated successfully
        </div>
      )}

      {/* Profile card */}
      <div className="card p-6 mb-4 animate-fade-up">
        {/* Avatar + name */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center font-syne font-bold text-xl text-accent">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-syne font-bold text-lg">{user?.name}</p>
              <p className="text-sm text-muted">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setEditing((v) => !v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              editing
                ? "border-accent-pink/40 text-accent-pink bg-accent-pink/10"
                : "border-border-2 text-muted hover:text-[var(--text)] hover:border-accent/40"
            }`}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 gap-4">
          {/* Name */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-2 font-semibold mb-1.5 block">
              Full Name
            </label>
            {editing ? (
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            ) : (
              <p className="text-sm py-2.5">{user?.name || "—"}</p>
            )}
          </div>

          {/* Email — not editable */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-2 font-semibold mb-1.5 block">
              Email
            </label>
            <p className="text-sm py-2.5 text-muted">{user?.email}</p>
          </div>

          {/* College */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-2 font-semibold mb-1.5 block">
              College
            </label>
            {editing ? (
              <input
                className="input-field"
                placeholder="e.g. DTU, VIT, AKTU"
                value={form.college}
                onChange={(e) => update("college", e.target.value)}
              />
            ) : (
              <p className="text-sm py-2.5">{user?.college || "—"}</p>
            )}
          </div>

          {/* Branch + Grad Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-2 font-semibold mb-1.5 block">
                Branch
              </label>
              {editing ? (
                <input
                  className="input-field"
                  placeholder="e.g. CSE, ECE"
                  value={form.branch}
                  onChange={(e) => update("branch", e.target.value)}
                />
              ) : (
                <p className="text-sm py-2.5">{user?.branch || "—"}</p>
              )}
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-2 font-semibold mb-1.5 block">
                Grad Year
              </label>
              {editing ? (
                <input
                  className="input-field"
                  placeholder="e.g. 2026"
                  value={form.gradYear}
                  onChange={(e) => update("gradYear", e.target.value)}
                />
              ) : (
                <p className="text-sm py-2.5">{user?.gradYear || "—"}</p>
              )}
            </div>
          </div>

          {/* CGPA */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-2 font-semibold mb-1.5 block">
              CGPA
            </label>
            {editing ? (
              <input
                className="input-field"
                placeholder="e.g. 8.5"
                value={form.cgpa}
                onChange={(e) => update("cgpa", e.target.value)}
              />
            ) : (
              <p className="text-sm py-2.5">{user?.cgpa || "—"}</p>
            )}
          </div>
        </div>

        {/* Save button */}
        {editing && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full mt-6 py-3 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes →"}
          </button>
        )}
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-accent-pink/20 animate-fade-up">
        <p className="font-syne font-bold text-sm mb-1">Account</p>
        <p className="text-xs text-muted mb-4">
          Logout from your PlaceIQ account on this device.
        </p>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-lg text-sm font-medium border border-accent-pink/30 text-accent-pink bg-accent-pink/10 hover:bg-accent-pink/20 transition-all"
        >
          Logout →
        </button>
      </div>
    </div>
  );
}
