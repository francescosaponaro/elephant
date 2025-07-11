import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { questions, originalText } = await req.json();

  const prompt = `
Based on the following text:

"${originalText}"

Grade the user's answers as true or false. Respond with JSON in this format:
[
  { "question": "...", "answer": "...", "correct": true }
]

Questions and user answers:
${JSON.stringify(questions, null, 2)}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  let gradedAnswers = [];
  try {
    gradedAnswers = JSON.parse(res.choices[0].message?.content || "[]");
  } catch (err) {
    console.error("Failed to parse grading result:", err);
  }

  return NextResponse.json({ gradedAnswers });
}
