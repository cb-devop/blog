import { getAiSettings } from "./settings-store";

// Provider -> default base URL mapping. All use OpenAI-compatible /chat/completions.
const PROVIDER_BASE_URLS: Record<string, string> = {
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai/",
  openai: "https://api.openai.com/v1/",
  openrouter: "https://openrouter.ai/api/v1/",
  groq: "https://api.groq.com/openai/v1/",
  mistral: "https://api.mistral.ai/v1/",
};

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCallOptions {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
}

function resolveBaseUrl(): { baseUrl: string; apiKey: string } {
  const ai = getAiSettings();
  let baseUrl = ai.aiBaseUrl?.trim();
  if (!baseUrl) {
    baseUrl = PROVIDER_BASE_URLS[ai.aiProvider] || PROVIDER_BASE_URLS.openai;
  }
  // Ensure trailing slash so "v1" + "/chat/completions" works.
  if (!baseUrl.endsWith("/")) baseUrl += "/";
  return { baseUrl, apiKey: ai.aiApiKey };
}

/**
 * Call the configured AI provider using the OpenAI-compatible Chat Completions API.
 * Works with Gemini (OpenAI-compatible mode), OpenAI, OpenRouter, Groq, Mistral, etc.
 */
export async function callAi(options: AiCallOptions): Promise<string> {
  const ai = getAiSettings();
  if (!ai.aiApiKey || !ai.aiModel) {
    throw new Error("AI provider is not configured. Set the API key and model in Settings.");
  }

  const { baseUrl, apiKey } = resolveBaseUrl();
  const url = `${baseUrl}chat/completions`;

  const body: Record<string, unknown> = {
    model: ai.aiModel,
    messages: options.messages,
    temperature: options.temperature ?? ai.aiTemperature,
  };
  if (options.maxTokens) {
    body.max_tokens = options.maxTokens;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000); // 2 min

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // OpenRouter accepts these optional headers; harmless elsewhere.
        "HTTP-Referer": "https://localhost",
        "X-Title": "PremiumBlog Admin",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("AI request timed out. Try again or use a shorter prompt.");
    }
    throw new Error(`Failed to reach AI provider: ${err instanceof Error ? err.message : "network error"}`);
  }
  clearTimeout(timeout);

  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = errBody?.error?.message || errBody?.message || JSON.stringify(errBody).slice(0, 300);
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(`AI provider error (${res.status}): ${detail || res.statusText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned an empty response. Try adjusting your prompt.");
  }
  return content as string;
}

/** Strip markdown code fences and leading/trailing prose that some models add. */
export function extractHtml(content: string): string {
  let html = content.trim();
  // Remove ```html ... ``` or ``` ... ``` fences
  const fenceMatch = html.match(/```(?:html|xml)?\s*\n?([\s\S]*?)```/i);
  if (fenceMatch) {
    html = fenceMatch[1].trim();
  }
  // If the model wrapped the whole article in a single <html>/<body>, extract inner
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1].trim();
  }
  return html;
}

/** Build a system prompt; merges the stored default with any per-request override. */
export function buildSystemPrompt(override?: string): string {
  const base = getAiSettings().aiSystemPrompt?.trim();
  if (override) {
    return base ? `${base}\n\n${override}` : override;
  }
  return base;
}
