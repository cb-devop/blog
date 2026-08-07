"use client";

import { useState, useRef } from "react";
import {
  Sparkles, Loader2, Wand2, RefreshCw, Check, Code, Eye, Pencil,
  FileText, AlertCircle, Copy, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const TONES = ["Informative", "Casual", "Professional", "Tutorial", "Opinionated", "Story-driven"];
const LENGTHS = [
  "Short (~600 words)",
  "Medium (~1200 words)",
  "Long (~2000 words)",
  "In-depth (~3000 words)",
];

interface AiArticleGeneratorProps {
  /** Called when user inserts the AI output into the post editor */
  onInsert?: (html: string, meta?: { title?: string; excerpt?: string }) => void;
  /** If true, show a "Save as Draft" action that creates a draft post via the API */
  enableSaveDraft?: boolean;
  /** Optional initial content (for refine-from-existing flow) */
  initialContent?: string;
}

interface AiResult {
  content: string;
  title: string;
  excerpt: string;
}

export function AiArticleGenerator({
  onInsert,
  enableSaveDraft = true,
  initialContent = "",
}: AiArticleGeneratorProps) {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState(LENGTHS[1]);
  const [keywords, setKeywords] = useState("");
  const [language, setLanguage] = useState("English");

  const [result, setResult] = useState<AiResult | null>(null);
  const [refineInstruction, setRefineInstruction] = useState("");
  const [refineHistory, setRefineHistory] = useState<string[]>([]);

  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [editingHtml, setEditingHtml] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic for the article.");
      return;
    }
    setError(null);
    setGenerating(true);
    setResult(null);
    setRefineHistory([]);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, instructions, tone, length, keywords, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult({ content: data.content, title: data.title || "", excerpt: data.excerpt || "" });
      toast({ title: "Article generated", description: "Review and refine below." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setError(msg);
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!result?.content) return;
    if (!refineInstruction.trim()) {
      setError("Describe what you want the AI to change.");
      return;
    }
    setError(null);
    setRefining(true);
    try {
      const res = await fetch("/api/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: result.content, instruction: refineInstruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refinement failed");
      setRefineHistory((h) => [...h, refineInstruction]);
      setResult((prev) => (prev ? { ...prev, content: data.content } : prev));
      setRefineInstruction("");
      toast({ title: "Content refined", description: "AI applied your changes." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Refinement failed";
      setError(msg);
      toast({ title: "Refinement failed", description: msg, variant: "destructive" });
    } finally {
      setRefining(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!result?.content) return;
    setSavingDraft(true);
    setError(null);
    try {
      const title = result.title || topic;
      const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 80) || `ai-${Date.now()}`;
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content: result.content,
          excerpt: result.excerpt || "",
          status: "DRAFT",
          seo: {
            metaTitle: title,
            metaDescription: result.excerpt || "",
            metaKeywords: keywords,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to save draft");
      toast({
        title: "Saved as draft",
        description: `Created draft: "${title}". Review it under Posts, then publish when ready.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save draft";
      setError(msg);
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleInsert = () => {
    if (!result?.content) return;
    onInsert?.(result.content, { title: result.title, excerpt: result.excerpt });
    toast({ title: "Inserted into editor", description: "Edit freely below." });
  };

  const handleCopyHtml = async () => {
    if (!result?.content) return;
    try {
      await navigator.clipboard.writeText(result.content);
      toast({ title: "HTML copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleManualEdit = (html: string) => {
    setResult((prev) => (prev ? { ...prev, content: html } : prev));
  };

  const wordCount = result?.content
    ? (result.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Prompt / Input Card */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI Article Writer</h2>
            <p className="text-sm text-muted-foreground">
              Describe what you want — the AI writes it. Then refine, edit manually, or save as a draft.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Topic / Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder='e.g. "Getting started with Prisma and SQLite"'
              disabled={generating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Instructions <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Include a comparison table of ORMs, a code snippet for the schema, and a troubleshooting section..."
              rows={3}
              disabled={generating}
            />
          </div>

          {/* Advanced controls (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAdvanced ? "Hide options" : "Show options (tone, length, keywords, language)"}
            </button>
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-4 rounded-lg bg-muted/30 border border-border">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    disabled={generating}
                  >
                    {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Length</label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    disabled={generating}
                  >
                    {LENGTHS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Keywords</label>
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="prisma, sqlite, orm"
                    disabled={generating}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Language</label>
                  <Input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="English"
                    disabled={generating}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="button" onClick={handleGenerate} disabled={generating || !topic.trim()} className="flex items-center gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {generating ? "Generating..." : "Generate Article"}
            </Button>
            {initialContent && !result && (
              <Button type="button" variant="outline" onClick={() => setResult({ content: initialContent, title: "", excerpt: "" })}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refine existing content
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <Card className="p-0 overflow-hidden">
          {/* Result header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                {result.title ? result.title.slice(0, 60) : "Generated Article"}
              </span>
              {wordCount > 0 && (
                <span className="text-[11px] text-muted-foreground font-mono">~{wordCount} words</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setView("preview")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${view === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
              <button
                type="button"
                onClick={() => setView("code")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${view === "code" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Code className="h-3.5 w-3.5" /> HTML
              </button>
            </div>
          </div>

          {/* Result body */}
          <div className="max-h-[60vh] overflow-y-auto">
            {view === "preview" ? (
              <div
                ref={outputRef}
                className="prose prose-sm dark:prose-invert max-w-none p-5"
                dangerouslySetInnerHTML={{ __html: result.content }}
              />
            ) : (
              <div className="p-3">
                <Textarea
                  value={result.content}
                  onChange={(e) => {
                    handleManualEdit(e.target.value);
                    setEditingHtml(true);
                  }}
                  rows={18}
                  className="font-mono text-xs"
                  placeholder="Article HTML..."
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {editingHtml ? "Manual edits will be preserved when you refine or save." : "Raw HTML output — edit directly if needed."}
                </p>
              </div>
            )}
          </div>

          {/* Refine section */}
          <div className="border-t p-4 bg-muted/10">
            <div className="flex items-center gap-2 mb-2">
              <Pencil className="h-3.5 w-3.5 text-primary" />
              <label className="text-sm font-medium text-foreground">Ask AI to modify</label>
            </div>
            <div className="flex gap-2">
              <Input
                value={refineInstruction}
                onChange={(e) => setRefineInstruction(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleRefine(); } }}
                placeholder='e.g. "Add a code example for migrations" or "Make the intro shorter"'
                disabled={refining}
              />
              <Button type="button" onClick={handleRefine} disabled={refining || !refineInstruction.trim()} className="flex items-center gap-2 shrink-0">
                {refining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {refining ? "Refining..." : "Refine"}
              </Button>
            </div>
            {refineHistory.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-muted-foreground py-0.5">History:</span>
                {refineHistory.map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[11px] bg-muted text-muted-foreground border border-border truncate max-w-[200px]">
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t p-4 flex flex-wrap items-center gap-2">
            {onInsert && (
              <Button type="button" onClick={handleInsert} className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Insert into editor
              </Button>
            )}
            {enableSaveDraft && (
              <Button type="button" variant="default" onClick={handleSaveDraft} disabled={savingDraft} className="flex items-center gap-2">
                {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {savingDraft ? "Saving..." : "Save as Draft"}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleCopyHtml} className="flex items-center gap-2">
              <Copy className="h-4 w-4" /> Copy HTML
            </Button>
            <Button type="button" variant="ghost" onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 ml-auto">
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
