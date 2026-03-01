"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, CheckCircle2, ChevronRight } from "lucide-react";

type Company = {
  id: string;
  name: string;
  shortName: string;
};

const difficulties = ["Easy", "Medium", "Hard"];
const categories = ["DSA", "Aptitude", "HR", "Technical"];
const rounds = [
  "Online Assessment",
  "Technical Round 1",
  "Technical Round 2",
  "Managerial Round",
  "HR Round",
];
const currentYear = new Date().getFullYear();
const years = [currentYear, currentYear - 1, currentYear - 2];

const tagSuggestions = [
  "Array", "String", "Tree", "Graph", "DP", "Sorting",
  "Binary Search", "Linked List", "Stack", "Queue",
  "OS", "DBMS", "OOP", "Networking", "SQL",
  "Probability", "Aptitude", "Behavioral",
];

const difficultyConfig: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  Easy: {
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/40",
    glow: "shadow-[0_0_20px_rgba(74,222,128,0.15)]",
  },
  Medium: {
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/40",
    glow: "shadow-[0_0_20px_rgba(250,204,21,0.15)]",
  },
  Hard: {
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/40",
    glow: "shadow-[0_0_20px_rgba(244,114,182,0.15)]",
  },
};

export default function SubmitPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [step, setStep] = useState(1); // multi-step feel

  const [form, setForm] = useState({
    companyId: "",
    question: "",
    difficulty: "Medium",
    category: "DSA",
    round: "Technical Round 1",
    year: currentYear.toString(),
    tags: [] as string[],
  });

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => setCompanies(data));
  }, []);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const addTag = (tag: string) => {
    const cleaned = tag.trim();
    if (!cleaned || form.tags.includes(cleaned)) return;
    setForm((f) => ({ ...f, tags: [...f.tags, cleaned] }));
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const handleSubmit = async () => {
    setError("");
    if (!form.companyId) { setError("Please select a company"); return; }
    if (!form.question.trim()) { setError("Please enter the question"); return; }
    if (form.question.trim().length < 15) { setError("Question is too short"); return; }

    setSaving(true);
    const res = await fetch("/api/pyqs/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error); return; }
    setSubmitted(true);
  };

  const handleAnother = () => {
    setSubmitted(false);
    setForm({
      companyId: form.companyId,
      question: "",
      difficulty: "Medium",
      category: "DSA",
      round: "Technical Round 1",
      year: currentYear.toString(),
      tags: [],
    });
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8">
        <div className="text-center animate-fade-up max-w-md">
          {/* Glowing success icon */}
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 rounded-2xl bg-green-400/10 border border-green-400/30 flex items-center justify-center"
              style={{ boxShadow: "0 0 40px rgba(74,222,128,0.2)" }}>
              <CheckCircle2 size={36} className="text-green-400" />
            </div>
          </div>

          <h2 className="font-display font-extrabold text-3xl mb-3">
            Question Added! 🎉
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Your question is now live in the database and visible to students prepping for{" "}
            <span className="text-slate-100 font-medium">
              {companies.find((c) => c.id === form.companyId)?.name}
            </span>
            . Thank you for contributing 🙏
          </p>

          <div className="flex gap-3 justify-center">
            <button onClick={handleAnother} className="btn-primary px-6 py-2.5">
              Submit Another
            </button>
            <button
              onClick={() => router.push("/prep")}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-sm text-slate-400 hover:text-slate-100 transition-all"
            >
              View Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10 max-w-2xl">
      {/* Hero */}
      <div className="mb-10 animate-fade-up">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
          ● Contribute
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight mb-3">
          Share what they{" "}
          <span className="text-gradient">actually asked</span>
        </h1>
        <p className="text-slate-400 text-[15px] leading-relaxed">
          Real questions from real interviews. Every submission helps a batchmate
          walk in prepared instead of guessing.
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-6 animate-fade-up">

        {/* Company selector */}
        <div className="card p-5">
          <label className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-3 block">
            Which company? *
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => update("companyId", c.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                  form.companyId === c.id
                    ? "border-primary/50 bg-primary/10 text-slate-100"
                    : "border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-100"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-[9px] shrink-0 ${
                  form.companyId === c.id ? "bg-primary/20 text-primary" : "bg-white/5 text-slate-400"
                }`}>
                  {c.shortName.slice(0, 3)}
                </div>
                <span className="text-xs font-medium truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Question textarea */}
        <div className="card p-5">
          <label className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-3 block">
            The Question *
          </label>
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-slate-500 resize-none focus:border-primary/40 transition-all leading-relaxed"
            rows={5}
            placeholder="Type the exact question as it was asked in your interview. Be as specific as possible..."
            value={form.question}
            onChange={(e) => update("question", e.target.value)}
          />
          <div className="flex justify-between mt-2">
            <p className="text-[10px] text-slate-500">Be specific — exact wording helps others prepare better</p>
            <p className={`text-[10px] ${form.question.length > 400 ? "text-pink-400" : "text-slate-500"}`}>
              {form.question.length}/500
            </p>
          </div>
        </div>

        {/* Difficulty + Category */}
        <div className="card p-5">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-3 block">
                Difficulty *
              </label>
              <div className="flex flex-col gap-2">
                {difficulties.map((d) => {
                  const cfg = difficultyConfig[d];
                  const isActive = form.difficulty === d;
                  return (
                    <button
                      key={d}
                      onClick={() => update("difficulty", d)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        isActive
                          ? `${cfg.color} ${cfg.bg} ${cfg.border} ${cfg.glow}`
                          : "border-white/5 text-slate-400 hover:border-white/10"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-3 block">
                Category *
              </label>
              <div className="flex flex-col gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => update("category", c)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      form.category === c
                        ? "border-primary/50 bg-primary/10 text-primary shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                        : "border-white/5 text-slate-400 hover:border-white/10"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Round + Year */}
        <div className="card p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-3 block">
                Interview Round
              </label>
              <div className="flex flex-col gap-1.5">
                {rounds.map((r) => (
                  <button
                    key={r}
                    onClick={() => update("round", r)}
                    className={`text-left px-3 py-2 rounded-lg text-xs transition-all ${
                      form.round === r
                        ? "bg-white/5 text-slate-100 border border-white/10"
                        : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-3 block">
                Year Asked
              </label>
              <div className="flex flex-col gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => update("year", y.toString())}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      form.year === y.toString()
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-white/5 text-slate-400 hover:border-white/10"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="card p-5">
          <label className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-3 block">
            Tags <span className="normal-case text-slate-500 font-normal">(optional)</span>
          </label>

          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-pink-400 transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-primary/40 transition-all"
              placeholder="Type a tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }
              }}
            />
            <button
              onClick={() => addTag(tagInput)}
              className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 transition-all"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tagSuggestions
              .filter((t) => !form.tags.includes(t))
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-white/5 text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                >
                  + {tag}
                </button>
              ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-pink-400/10 border border-pink-400/20 text-pink-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving || !form.companyId || !form.question.trim()}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ boxShadow: "0 0 30px rgba(99,102,241,0.3)" }}
        >
          {saving ? (
            "Submitting..."
          ) : (
            <>
              Submit to PlaceIQ Database
              <ChevronRight size={18} />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500 pb-4">
          Your submission is immediately live — no review needed.
          Help your batchmates ace their interviews 🎯
        </p>
      </div>
    </div>
  );
}