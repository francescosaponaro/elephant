// /pages/api/generate.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { text } = await req.json();

  const promptSummary = `Summarize the following text in 3-4 sentences in the same language:\n\n${text}`;
  const promptQuestions = `Create 3 flashcard questions from the following text in the same language as the text. Respond in JSON format like this:
[
  { "question": "Is the sky blue?", "type": "yesno" },
  { "question": "What is the main idea?", "type": "text" }
]
Text:\n\n${text}`;

  const [summaryRes, questionRes] = await Promise.all([
    openai.chat.completions.create({
      messages: [{ role: "user", content: promptSummary }],
      model: "gpt-3.5-turbo",
    }),
    openai.chat.completions.create({
      messages: [{ role: "user", content: promptQuestions }],
      model: "gpt-3.5-turbo",
    }),
  ]);

  const summary = summaryRes.choices[0]?.message?.content || "";

  let questions: { question: string; type: "yesno" | "text" }[] = [];

  try {
    const raw = questionRes.choices[0]?.message?.content || "";
    questions = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse flashcard questions:", err);
  }

  return NextResponse.json({ summary, questions });
}
