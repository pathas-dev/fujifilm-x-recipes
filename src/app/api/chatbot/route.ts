import { NextResponse } from "next/server";
import { retrieve } from "@/app/api/chatbot/retrieval";
import { formatContext } from "@/app/api/chatbot/context";
import { createLLM, createPromptTemplate } from "@/app/api/chatbot/llm";
import { createStreamingResponse } from "@/app/api/chatbot/streaming";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    const results = await retrieve(question);
    const context = formatContext(results);

    const llm = createLLM();
    const prompt = createPromptTemplate();
    const chain = prompt.pipe(llm);

    const stream = await createStreamingResponse(chain, context, question);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chatbot POST Error:", error);
    return NextResponse.json(
      { error: "Failed to process chatbot request" },
      { status: 500 }
    );
  }
}
