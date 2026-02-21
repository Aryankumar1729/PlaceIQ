import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are PlaceIQ AI, an expert placement assistant for Indian BTech students.
You have access to a database of 14,000+ company-specific interview questions (PYQs), 
placement statistics, CTC data, and hiring patterns for 248 companies.

Your job:
- Give data-backed, specific advice (not generic tips)
- Focus on company-specific prep strategies
- Be concise and direct — students are time-poor
- Speak like a well-placed senior who's been through it

Keep responses under 150 words unless asked for a detailed plan.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Only pass user messages, filter out bot greeting
    const userMessages = messages.filter(
      (m: { role: string; content: string }) =>
        m.role === "user" && m.content?.trim()
    );

    if (!userMessages.length) {
      return NextResponse.json({ error: "No valid user message" }, { status: 400 });
    }

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        // Pass full conversation history for context
        ...messages
          .filter((m: { role: string; content: string }) => m.content?.trim())
          .map((m: { role: string; content: string }) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
      ],
    });

    const response = result.choices[0].message.content ?? "Sorry, I couldn't generate a response.";
    return NextResponse.json({ response });

  } catch (err) {
    console.error("Groq error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}