"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";

export default function ResumeUploader() {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    // TODO: upload to /api/resume/score
  };

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 mb-6 ${
        dragging
          ? "border-primary/60 bg-primary/5"
          : "border-white/10 hover:border-primary/40 hover:bg-white/[0.02]"
      }`}
      onClick={() => inputRef.current?.click()}
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
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
      <Upload size={32} className="mx-auto mb-3 text-slate-600" />
      {fileName ? (
        <>
          <p className="font-display font-bold text-lg mb-1">{fileName}</p>
          <p className="text-sm text-green-400">Ready to score →</p>
        </>
      ) : (
        <>
          <p className="font-display font-bold text-lg mb-1">Drop your resume here</p>
          <p className="text-sm text-slate-400">PDF or DOCX · Analyzed against real JDs from your target companies</p>
          <button className="btn-primary mt-5 text-sm">Browse File</button>
        </>
      )}
    </div>
  );
}
