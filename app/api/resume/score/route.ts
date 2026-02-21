import { NextRequest, NextResponse } from "next/server";

// TODO: Wire up real NLP pipeline
// 1. Extract text from PDF/DOCX
// 2. Embed with sentence-transformers
// 3. Compare against company JD embeddings in Postgres
// 4. Return scored breakdown

export async function POST(req: NextRequest) {
  try {
    // Placeholder — replace with real scoring logic
    const _formData = await req.formData();

    const mockScore = {
      overall: 74,
      breakdown: [
        { label: "Impact & Quantification", score: 75, status: "Good" },
        { label: "Keyword Match (TCS JD)", score: 58, status: "Fair" },
        { label: "Project Relevance", score: 82, status: "Strong" },
        { label: "ATS Formatting", score: 40, status: "Needs Work" },
      ],
      suggestions: [
        "Add metrics to your project descriptions",
        "Include 'Java', 'REST API', 'SDLC' to improve TCS keyword match",
        "Remove table formatting — ATS systems can't parse it",
        "Add a skills section with explicit tech stack listing",
      ],
    };

    return NextResponse.json(mockScore);
  } catch {
    return NextResponse.json({ error: "Failed to score resume" }, { status: 500 });
  }
}
