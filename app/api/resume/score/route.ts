import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// pdf-parse v1 is CommonJS — externalized via next.config.mjs
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type RoleType = "tech" | "non-tech" | "core";

const PROMPTS: Record<RoleType, string> = {
  tech: `You are an expert resume reviewer for Indian BTech tech/software placement drives.
Score the resume out of 100 across these four dimensions:
1. Impact & Quantification — does the resume use numbers/metrics?
2. Keyword Strength — does it contain relevant tech keywords (DSA, frameworks, tools, languages)?
3. Project Relevance — are projects well-described and technically impressive?
4. ATS Formatting — is the structure clean, parseable, no tables/images?`,

  "non-tech": `You are an expert resume reviewer for Indian BTech non-tech/business placement drives (consulting, finance, FMCG, management roles).
Score the resume out of 100 across these four dimensions:
1. Impact & Quantification — does the resume use numbers/metrics for business outcomes?
2. Keyword Strength — does it contain relevant business keywords (leadership, strategy, analytics, communication, case studies)?
3. Experience Relevance — are internships/experiences well-described with clear business impact?
4. ATS Formatting — is the structure clean, professional, parseable, no tables/images?`,

  core: `You are an expert resume reviewer for Indian BTech core engineering placement drives (mechanical, electrical, civil, chemical roles).
Score the resume out of 100 across these four dimensions:
1. Impact & Quantification — does the resume use numbers/metrics for engineering outcomes?
2. Keyword Strength — does it contain relevant core engineering keywords (design, simulation, CAD, manufacturing, testing, research)?
3. Project Relevance — are projects/research well-described with clear engineering depth?
4. ATS Formatting — is the structure clean, parseable, no tables/images?`,
};

const JSON_FORMAT = `\n\nReturn ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "overall": <number 0-100>,
  "breakdown": [
    { "label": "<dimension 1 name>", "score": <number>, "status": "<Weak|Fair|Good|Strong>" },
    { "label": "<dimension 2 name>", "score": <number>, "status": "<Weak|Fair|Good|Strong>" },
    { "label": "<dimension 3 name>", "score": <number>, "status": "<Weak|Fair|Good|Strong>" },
    { "label": "<dimension 4 name>", "score": <number>, "status": "<Weak|Fair|Good|Strong>" }
  ],
  "suggestions": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>", "<actionable tip 4>"]
}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const roleType = (formData.get("roleType") as RoleType) || "tech";
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // Extract text from PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    try {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } catch (e: unknown) {
      const detail = e instanceof Error ? e.message : "Unknown parse error";
      return NextResponse.json({ error: `Could not parse PDF: ${detail}` }, { status: 400 });
    }

    if (text.trim().length < 50) {
      return NextResponse.json({ error: "Resume appears empty or image-only. Use a text-based PDF." }, { status: 400 });
    }

    // Truncate to ~4000 chars to stay within token limits
    const trimmed = text.slice(0, 4000);

    const systemPrompt = (PROMPTS[roleType] ?? PROMPTS.tech) + JSON_FORMAT;

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Score this resume:\n\n${trimmed}` },
      ],
      temperature: 0.3,
    });

    const raw = result.choices[0].message.content ?? "";

    // Parse the JSON response
    try {
      const score = JSON.parse(raw);
      return NextResponse.json(score);
    } catch {
      // Try to extract JSON from the response if wrapped in text
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) return NextResponse.json(JSON.parse(match[0]));
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to score resume: ${msg}` }, { status: 500 });
  }
}
