import { Groq } from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GROQ_API_KEY;
let groq: Groq | null = null;

if (apiKey) {
  groq = new Groq({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model = "openai/gpt-oss-20b", temperature = 0.7 } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    if (!groq) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const completion = await groq.chat.completions.create({
      messages,
      model,
      temperature,
      max_tokens: 2048,
      stream: false,
    });

    return NextResponse.json({
      content: completion.choices[0]?.message?.content || "",
      model: completion.model,
    });
  } catch (error: any) {
    console.error("Groq API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get completion" },
      { status: 500 }
    );
  }
}
