"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";

type ScoreResult = {
  overall: number;
  breakdown: { label: string; score: number; status: string }[];
  suggestions: string[];
};

type Props = {
  onScore?: (result: ScoreResult, fileName: string) => void;
  roleType?: string;
};

export default function ResumeUploader({ onScore, roleType = "tech" }: Props) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setError("");
    setScoring(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("roleType", roleType);
      const res = await fetch("/api/resume/score", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Scoring failed"); setScoring(false); return; }
      onScore?.(data, file.name);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setScoring(false);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 mb-6 ${
        dragging
          ? "border-primary/60 bg-primary/5"
          : "border-white/10 hover:border-primary/40 hover:bg-white/[0.02]"
      }`}
      onClick={() => !scoring && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />

      {scoring ? (
        <>
          <Loader2 size={32} className="mx-auto mb-3 text-primary animate-spin" />
          <p className="font-display font-bold text-lg mb-1">Analyzing {fileName}...</p>
          <p className="text-sm text-slate-400">Extracting text & scoring with AI</p>
        </>
      ) : fileName && !error ? (
        <>
          <Upload size={32} className="mx-auto mb-3 text-green-400" />
          <p className="font-display font-bold text-lg mb-1">{fileName}</p>
          <p className="text-sm text-green-400">Scored ✓ — drop another to re-score</p>
        </>
      ) : (
        <>
          <Upload size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="font-display font-bold text-lg mb-1">Drop your resume here</p>
          <p className="text-sm text-slate-400">PDF · Analyzed & scored with AI in seconds</p>
          <button className="btn-primary mt-5 text-sm">Browse File</button>
        </>
      )}

      {error && (
        <p className="text-xs text-pink-400 mt-3">{error}</p>
      )}
    </div>
  );
}
