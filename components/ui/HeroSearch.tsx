"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

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
    <section className="mb-16 text-center flex flex-col items-center animate-fade-up">
      <span className="inline-block px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-primary bg-primary/10 mb-6 border border-primary/20">
        Interview Prep
      </span>
      <h1 className="text-5xl md:text-6xl font-display font-extrabold mb-6 tracking-tight leading-[1.1]">
        {company ? (
          <><span className="text-gradient">{company}</span><br /><span className="accent-gradient">most asked</span></>
        ) : searchParam ? (
          <>Results for<br /><span className="accent-gradient">"{searchParam}"</span></>
        ) : (
          <><span className="text-gradient">Most asked questions</span><br /><span className="accent-gradient">by company</span></>
        )}
      </h1>
      <p className="text-slate-400 text-lg max-w-2xl mb-12">
        {company
          ? `Showing questions specifically asked in ${company} interviews.`
          : (<>Sourced from real interview experiences across top-tier tech companies. <br />Updated in real-time by our global community.</>)}
      </p>

      {/* Search bar */}
      <div className="w-full max-w-2xl relative group">
        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center p-2 rounded-2xl bg-white/5 border border-white/10 focus-within:border-primary/50 transition-all duration-300">
          <Search size={20} className="ml-4 text-slate-400" />
          <input
            className="w-full bg-transparent border-none focus:ring-0 text-white px-4 py-3 text-lg placeholder:text-slate-500 outline-none"
            placeholder="Search by topic, e.g. arrays, DP, SQL..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-primary hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary/20"
          >
            Search <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}