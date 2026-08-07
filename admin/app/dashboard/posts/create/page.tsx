"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import { SeoForm } from "@/components/seo-form";
import { TagInput } from "@/components/tag-input";
import { RichEditor } from "@/components/rich-editor";
import { AiArticleGenerator } from "@/components/ai-article-generator";
import { ArrowLeft, Save, Eye, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showAiWriter, setShowAiWriter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    category: "",
    tags: [] as string[],
    status: "DRAFT",
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogImage: "",
    },
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.ok && res.json())
      .then((data) => setCategories(data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categories: formData.category ? [formData.category] : [],
        }),
      });
      if (response.ok) {
        router.push("/dashboard/posts");
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || error.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Create post error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/posts" className="p-2 rounded-lg hover:bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Post</h1>
            <p className="text-muted-foreground">Write and publish a new blog post</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Post</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Post Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Title <span className="text-destructive">*</span></label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter your post title" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Slug</label>
                <div className="flex items-center gap-2">
                  <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="post-url-slug" />
                  <Button type="button" variant="outline" onClick={() => {
                    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setFormData({ ...formData, slug });
                  }}>Generate</Button>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-foreground">Content <span className="text-destructive">*</span></label>
                  <button
                    type="button"
                    onClick={() => setShowAiWriter(!showAiWriter)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${showAiWriter ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {showAiWriter ? "Hide AI Writer" : "Write with AI"}
                  </button>
                </div>
                {showAiWriter && (
                  <div className="mb-4">
                    <AiArticleGenerator
                      onInsert={(html, meta) => {
                        const m = meta ?? {};
                        setFormData((prev) => ({
                          ...prev,
                          content: html,
                          title: prev.title || m.title || "",
                          excerpt: prev.excerpt || m.excerpt || "",
                          slug: prev.slug || (m.title ? m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : ""),
                        }));
                        toast({ title: "AI content inserted", description: "Edit freely in the editor below." });
                        setShowAiWriter(false);
                      }}
                    />
                  </div>
                )}
                <RichEditor
                  value={formData.content}
                  onChange={(html) => setFormData({ ...formData, content: html })}
                  placeholder="Start writing your post..."
                  minHeight="500px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Excerpt</label>
                <Textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Brief summary of your post (shown on blog listing)" rows={3} maxLength={200} />
                <p className="text-xs text-muted-foreground mt-1">{formData.excerpt.length}/200 characters</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Publish Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="SCHEDULED">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="outline" className="w-full" onClick={() => setFormData({ ...formData, status: 'DRAFT' })}>Save Draft</Button>
                <Button type="submit" variant="default" className="w-full" onClick={() => setFormData({ ...formData, status: 'PUBLISHED' })}>Publish</Button>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Tags</h3>
            <TagInput value={formData.tags} onChange={(tags) => setFormData({ ...formData, tags })} placeholder="Add tags (press Enter)" />
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Featured Image</h3>
            <ImageUpload value={formData.featuredImage} onChange={(url) => setFormData({ ...formData, featuredImage: url })} recommendedSize="1200x630" />
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">SEO Settings</h3>
            <SeoForm value={formData.seo} onChange={(seo) => setFormData({ ...formData, seo })} postTitle={formData.title} postExcerpt={formData.excerpt} />
          </Card>
        </div>
      </div>
    </form>
  );
}
