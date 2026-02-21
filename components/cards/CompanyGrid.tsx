import Link from "next/link";

type Company = {
  id: string;
  name: string;
  short: string;
  type: string;
  ctc: string;
  pyqs: number;
  rounds: number;
  barColors: string[];
  barWidths: string[];
  barLabel: string;
  accentClass: string;
  logoClass: string;
  topColor: string;
};

const companies: Company[] = [
  {
    id: "tcs",
    name: "Tata Consultancy Services",
    short: "TCS",
    type: "IT Services · Visits 200+ colleges",
    ctc: "3.6L",
    pyqs: 847,
    rounds: 4,
    barColors: ["#6c63ff", "#ff6584", "#43e97b"],
    barWidths: ["35%", "40%", "25%"],
    barLabel: "DSA · Aptitude · Verbal",
    accentClass: "text-accent",
    logoClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    topColor: "from-blue-600 to-blue-400",
  },
  {
    id: "google",
    name: "Google India",
    short: "G",
    type: "Product · Top-tier · Off-campus",
    ctc: "28L",
    pyqs: 312,
    rounds: 5,
    barColors: ["#6c63ff", "#4285f4", "#43e97b"],
    barWidths: ["70%", "20%", "10%"],
    barLabel: "DSA heavy",
    accentClass: "text-accent-green",
    logoClass: "bg-blue-400/10 text-blue-300 border border-blue-400/20",
    topColor: "from-blue-500 to-green-500",
  },
  {
    id: "infosys",
    name: "Infosys",
    short: "INF",
    type: "IT Services · SP + PP tracks",
    ctc: "6.5L",
    pyqs: 623,
    rounds: 3,
    barColors: ["#6c63ff", "#ff6584", "#43e97b"],
    barWidths: ["20%", "55%", "25%"],
    barLabel: "Aptitude heavy",
    accentClass: "text-accent",
    logoClass: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    topColor: "from-cyan-500 to-blue-500",
  },
  {
    id: "amazon",
    name: "Amazon",
    short: "AMZ",
    type: "E-commerce · SDE roles",
    ctc: "18L",
    pyqs: 489,
    rounds: 4,
    barColors: ["#6c63ff", "#ff9900", "#43e97b"],
    barWidths: ["45%", "40%", "15%"],
    barLabel: "LP + DSA",
    accentClass: "text-accent-green",
    logoClass: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    topColor: "from-orange-500 to-yellow-400",
  },
];

export default function CompanyGrid() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-syne text-lg font-bold">Trending Companies</h2>
        <Link href="/companies" className="text-xs text-accent hover:underline">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
        {companies.map((c) => (
          <Link
            key={c.id}
            href={`/prep?company=${c.name}`}
            className="card p-5 block hover:-translate-y-1 hover:shadow-card transition-all duration-200 animate-fade-up group relative overflow-hidden"
          >
            {/* Top accent line */}
            <div
              className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.topColor} opacity-0 group-hover:opacity-100 transition-opacity`}
            />

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-syne font-bold text-sm shrink-0 ${c.logoClass}`}
              >
                {c.short}
              </div>
              <div>
                <p className="font-syne font-bold text-[15px]">{c.name}</p>
                <p className="text-xs text-muted mt-0.5">{c.type}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { val: c.ctc, lbl: "Base CTC", color: c.accentClass },
                { val: c.pyqs.toString(), lbl: "PYQs", color: "text-accent-green" },
                { val: `${c.rounds} Rds`, lbl: "Process", color: "text-[var(--text)]" },
              ].map((s) => (
                <div key={s.lbl} className="bg-surface2 rounded-lg py-2.5 text-center">
                  <p className={`font-syne font-bold text-base ${s.color}`}>{s.val}</p>
                  <p className="text-[10px] text-muted mt-0.5">{s.lbl}</p>
                </div>
              ))}
            </div>

            {/* Topic bar */}
            <div>
              <div className="flex justify-between text-[11px] text-muted mb-1.5">
                <span>Topic distribution</span>
                <span>{c.barLabel}</span>
              </div>
              <div className="flex gap-0.5 h-1 rounded-full overflow-hidden bg-surface2">
                {c.barColors.map((color, i) => (
                  <div
                    key={i}
                    className="h-full rounded-sm"
                    style={{ width: c.barWidths[i], background: color }}
                  />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
