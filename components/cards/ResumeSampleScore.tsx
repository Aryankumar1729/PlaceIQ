const scores = [
  { label: "Impact & Quantification", pct: 75, status: "Good", color: "#43e97b" },
  { label: "Keyword Match (TCS JD)", pct: 58, status: "Fair", color: "#f6d365" },
  { label: "Project Relevance", pct: 82, status: "Strong", color: "#43e97b" },
  { label: "ATS Formatting", pct: 40, status: "Needs Work", color: "#ff6584" },
];

export default function ResumeSampleScore() {
  return (
    <div className="card p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <p className="font-display font-bold text-base">Sample Score — resume_v3.pdf</p>
        <p className="font-display font-extrabold text-3xl text-green-400">
          74<span className="text-base text-slate-500 font-normal">/100</span>
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {scores.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">{s.label}</span>
              <span style={{ color: s.color }}>{s.status}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.pct}%`, background: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
