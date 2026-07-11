"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
}

interface SeoFormProps {
  value: SeoData;
  onChange: (data: SeoData) => void;
  postTitle?: string;
  postExcerpt?: string;
}

export function SeoForm({ value, onChange }: SeoFormProps) {
  const [expanded, setExpanded] = useState(false);

  const updateField = (field: keyof SeoData, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const getPreviewTitle = () => {
    return value.metaTitle || "Page Title - Your Site Name";
  };

  const getPreviewDescription = () => {
    return value.metaDescription || "Page description will appear here. Make it compelling to improve click-through rates from search engines.";
  };

  return (
    <div className="border rounded-lg bg-card">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">
              SEO Settings
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Optimize your post for search engines
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="p-4 border-t space-y-6">
          {/* Search Preview */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Info className="h-4 w-4" />
              Search Engine Preview
            </label>
            <div className="bg-muted/50 p-4 rounded-lg border">
              <div className="max-w-[500px]">
                <p className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  {getPreviewTitle().substring(0, 60)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                  https://yoursite.com/blog/post-slug
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {getPreviewDescription().substring(0, 160)}
                </p>
              </div>
            </div>
          </div>

          {/* Meta Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Meta Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={value.metaTitle}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              placeholder="Enter SEO title (50-60 characters)"
              maxLength={60}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{value.metaTitle.length}/60 characters</span>
              <span className={value.metaTitle.length >= 50 && value.metaTitle.length <= 60 ? "text-green-600" : "text-yellow-600"}>
                {value.metaTitle.length < 50 ? "Too short" : value.metaTitle.length > 60 ? "Too long" : "Perfect"}
              </span>
            </div>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Meta Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={value.metaDescription}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              placeholder="Enter SEO description (150-160 characters)"
              maxLength={160}
              rows={3}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{value.metaDescription.length}/160 characters</span>
              <span className={value.metaDescription.length >= 150 && value.metaDescription.length <= 160 ? "text-green-600" : "text-yellow-600"}>
                {value.metaDescription.length < 150 ? "Too short" : value.metaDescription.length > 160 ? "Too long" : "Perfect"}
              </span>
            </div>
          </div>

          {/* Meta Keywords */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Meta Keywords (Optional)
            </label>
            <Input
              value={value.metaKeywords}
              onChange={(e) => updateField("metaKeywords", e.target.value)}
              placeholder="keyword1, keyword2 (comma separated)"
            />
          </div>

          {/* OG Image */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Open Graph Image
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recommended size: 1200x630px. Used when sharing on social media
            </p>
            <div className="flex gap-2">
              <Input
                value={value.ogImage}
                onChange={(e) => updateField("ogImage", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                className="px-3 py-2 border rounded-md text-sm hover:bg-muted transition-colors"
                onClick={() => {
                  // Open media library or prompt for URL
                  const url = prompt("Enter image URL:");
                  if (url) updateField("ogImage", url);
                }}
              >
                Browse
              </button>
            </div>
            {value.ogImage && (
              <div className="mt-2">
                <img src={value.ogImage} alt="OG Preview" className="h-32 rounded-lg object-cover border" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}