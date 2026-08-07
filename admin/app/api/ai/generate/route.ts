import { NextResponse } from "next/server";
import { requireAuth, apiError, logAudit, validateString, sanitizeArticleHtml } from "@/lib/security";
import { isAiConfigured } from "@/lib/settings-store";
import { callAi, buildSystemPrompt, extractHtml } from "@/lib/ai";

interface GenerateBody {
  topic?: string;
  instructions?: string;
  tone?: string;
  length?: string;
  keywords?: string;
  language?: string;
}

const TONES = ["Informative", "Casual", "Professional", "Tutorial", "Opinionated", "Story-driven"];
const LENGTHS = ["Short (~600 words)", "Medium (~1200 words)", "Long (~2000 words)", "In-depth (~3000 words)"];

export async function POST(request: Request) {
  const auth = requireAuth(request);
  if (!auth) return apiError("Unauthorized", 401);

  if (!isAiConfigured()) {
    return apiError("AI is not configured. Add an API key and model in Settings.", 400);
  }

  let body: GenerateBody;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const topic = validateString(body.topic ?? "", 500);
  if (!topic) return apiError("A topic is required", 400);

  const instructions = validateString(body.instructions ?? "", 2000);
  const tone = TONES.includes(body.tone ?? "") ? body.tone! : "Informative";
  const length = LENGTHS.includes(body.length ?? "") ? body.length! : "Medium (~1200 words)";
  const keywords = validateString(body.keywords ?? "", 300);
  const language = validateString(body.language ?? "", 50) || "English";

  const userPrompt = buildGenerationPrompt({ topic, instructions, tone, length, keywords, language });

  try {
    const raw = await callAi({
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 4096,
    });

    const html = sanitizeArticleHtml(extractHtml(raw));
    const title = extractTitleFromHtml(html);
    const excerpt = extractExcerptFromHtml(html);

    logAudit("ai.generate", auth.userId, `Generated article on: ${topic}`, request);

    return NextResponse.json({ content: html, title, excerpt, raw });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "AI generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildGenerationPrompt(args: {
  topic: string;
  instructions: string;
  tone: string;
  length: string;
  keywords: string;
  language: string;
}): string {
  const parts: string[] = [];
  parts.push(`Write a complete, original blog article about: "${args.topic}".`);
  parts.push(`Tone: ${args.tone}.`);
  parts.push(`Length: ${args.length}.`);
  parts.push(`Language: ${args.language}.`);
  if (args.keywords) parts.push(`Naturally incorporate these keywords: ${args.keywords}.`);
  if (args.instructions) parts.push(`Additional requirements: ${args.instructions}`);
  parts.push(
    "Format the response as clean, semantic HTML. Use <h2> and <h3> for section headings, <p> for paragraphs, <ul>/<ol> with <li> for lists, <blockquote> for quotes, and <pre><code class=\"language-xxx\"> for code blocks. Do NOT wrap the output in markdown code fences. Do NOT include an <h1> (the post title is rendered separately). Output only the article body HTML."
  );
  return parts.join("\n");
}

/** Pull the first <h2> as a title suggestion, or first sentence. */
function extractTitleFromHtml(html: string): string {
  const h2 = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (h2) return stripTags(h2[1]).trim().slice(0, 120);
  const firstP = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (firstP) return stripTags(firstP[1]).trim().slice(0, 140);
  return "";
}

function extractExcerptFromHtml(html: string): string {
  const firstP = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (firstP) return stripTags(firstP[1]).trim().slice(0, 200);
  return "";
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ");
}
