import { NextResponse } from "next/server";
import { requireAuth, apiError, logAudit, validateString, sanitizeArticleHtml } from "@/lib/security";
import { isAiConfigured } from "@/lib/settings-store";
import { callAi, buildSystemPrompt, extractHtml } from "@/lib/ai";

interface RefineBody {
  content: string;
  instruction: string;
}

export async function POST(request: Request) {
  const auth = requireAuth(request);
  if (!auth) return apiError("Unauthorized", 401);

  if (!isAiConfigured()) {
    return apiError("AI is not configured. Add an API key and model in Settings.", 400);
  }

  let body: RefineBody;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const content = body.content;
  const instruction = validateString(body.instruction ?? "", 2000);
  if (!content || typeof content !== "string") {
    return apiError("Existing content is required", 400);
  }
  if (!instruction) {
    return apiError("An instruction describing what to change is required", 400);
  }

  const userPrompt = `Here is the current article HTML:\n\n${content}\n\nPlease modify it according to this instruction: "${instruction}"\n\nReturn the complete, modified article as clean semantic HTML (same structure: h2/h3, p, ul/ol, blockquote, pre/code). Keep any code blocks intact unless told otherwise. Do NOT wrap the output in markdown code fences. Output only the article body HTML.`;

  try {
    const raw = await callAi({
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 4096,
    });

    const html = sanitizeArticleHtml(extractHtml(raw));

    logAudit("ai.refine", auth.userId, `Refined article: ${instruction.slice(0, 80)}`, request);

    return NextResponse.json({ content: html, raw });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "AI refinement failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
