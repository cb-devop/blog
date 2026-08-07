"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2, Link2, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  recommendedSize?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  recommendedSize,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // Cloudinary ya Cloudflare R2 use kar sakte hain
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        onChange(url);
      } else {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    onChange("");
    setUrlInput("");
    setUrlError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const applyUrl = () => {
    const url = urlInput.trim();
    if (!url) {
      setUrlError("Please enter an image URL");
      return;
    }
    // Allow http(s), relative paths (/uploads/...), or data: URIs
    if (
      !/^(https?:\/\/|\/|data:image\/)/i.test(url)
    ) {
      setUrlError("URL must start with http(s)://, /, or be a data:image URI");
      return;
    }
    setUrlError("");
    onChange(url);
    setTab("upload");
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        Featured Image
      </label>

      {value ? (
        <div className="relative group">
          <div className="aspect-video w-full overflow-hidden rounded-lg border-2 border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Featured"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          {/* Toggle: Upload / URL */}
          <div className="flex gap-1 p-1 rounded-lg bg-muted/60 w-fit">
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                tab === "upload"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </button>
            <button
              type="button"
              onClick={() => setTab("url")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                tab === "url"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link2 className="h-3.5 w-3.5" />
              Use URL
            </button>
          </div>

          {tab === "upload" ? (
            <div
              className="aspect-video w-full border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              {loading ? (
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground">
                {loading ? "Uploading..." : "Click to upload image"}
              </p>
              <p className="text-xs text-muted-foreground/70">
                PNG, JPG up to 5MB
              </p>
              {recommendedSize && (
                <p className="text-xs text-muted-foreground/70">
                  Recommended size: {recommendedSize}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (urlError) setUrlError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyUrl();
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button type="button" size="sm" onClick={applyUrl}>
                  <Check className="h-4 w-4 mr-1" />
                  Apply
                </Button>
              </div>
              {urlError && (
                <p className="text-xs text-destructive">{urlError}</p>
              )}
              <p className="text-xs text-muted-foreground/70">
                Paste any image URL — it will be used directly as the image source.
              </p>
            </div>
          )}
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {value && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            Change Image
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={clearImage}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}