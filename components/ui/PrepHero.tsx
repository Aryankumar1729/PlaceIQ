"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function PrepHero() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const company = searchParams.get("company");
  const searchParam = searchParams.get("search");
  const [query, setQuery] = useState(searchParam ?? "");

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/prep?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="mb-8 animate-fade-up">
      <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
        ● Interview Prep
      </p>
      <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">
        {company ? (
          <>{company} — <span className="text-gradient">most asked</span></>
        ) : searchParam ? (
          <>Results for <span className="text-gradient">"{searchParam}"</span></>
        ) : (
          <>Most asked questions<br /><span className="text-gradient">by company</span></>
        )}
      </h1>
      <p className="text-slate-400 text-[15px] mb-6">
        {company
          ? `Showing questions specifically asked in ${company} interviews.`
          : "Sourced from real interview experiences. Updated monthly."}
      </p>

      {/* Search bar */}
      <div className="flex gap-3 p-2 bg-card-dark border border-white/5 rounded-2xl max-w-xl">
        <div className="flex items-center gap-3 flex-1 px-3">
          <Search size={16} className="text-slate-500 shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
            placeholder="Search by topic, e.g. arrays, DP, SQL..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                router.push("/prep");
              }}
              className="text-slate-400 hover:text-slate-100 transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <button onClick={handleSearch} className="btn-primary px-5 py-2 text-sm">
          Search →
        </button>
      </div>
    </div>
  );
}