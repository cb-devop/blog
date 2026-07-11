"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Link, Image, Undo, Redo, Eye, Edit3, Pilcrow,
  Brackets, Highlighter, ChevronDown
} from "lucide-react";

// Initialize lowlight with common languages
const lowlight = createLowlight(common);

// Available languages for code blocks
const CODE_LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "bash", label: "Bash/Shell" },
  { id: "sql", label: "SQL" },
  { id: "json", label: "JSON" },
  { id: "xml", label: "XML" },
  { id: "java", label: "Java" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "markdown", label: "Markdown" },
  { id: "yaml", label: "YAML" },
];

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = "500px",
}: RichEditorProps) {
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showCodeLangPicker, setShowCodeLangPicker] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const codeLangPickerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false, // Disable default code block to use lowlight one
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
      ImageExtension.configure({ inline: false }),
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      Highlight,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3",
      },
    },
  });

  // Sync editor content when value changes externally (e.g., edit page loading)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Close language picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (codeLangPickerRef.current && !codeLangPickerRef.current.contains(e.target as Node)) {
        setShowCodeLangPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const toggleHeading1 = useCallback(() => editor?.chain().focus().toggleHeading({ level: 1 }).run(), [editor]);
  const toggleHeading2 = useCallback(() => editor?.chain().focus().toggleHeading({ level: 2 }).run(), [editor]);
  const toggleHeading3 = useCallback(() => editor?.chain().focus().toggleHeading({ level: 3 }).run(), [editor]);
  const toggleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const toggleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);
  const toggleBlockquote = useCallback(() => editor?.chain().focus().toggleBlockquote().run(), [editor]);
  const toggleCodeBlock = useCallback(() => editor?.chain().focus().toggleCodeBlock().run(), [editor]);
  const toggleHighlight = useCallback(() => editor?.chain().focus().toggleHighlight().run(), [editor]);
  const undo = useCallback(() => editor?.chain().focus().undo().run(), [editor]);
  const redo = useCallback(() => editor?.chain().focus().redo().run(), [editor]);

  const setCodeLanguage = useCallback((lang: string) => {
    if (!editor) return;
    editor.chain().focus().updateAttributes("codeBlock", { language: lang }).run();
    setShowCodeLangPicker(false);
  }, [editor]);

  const getCurrentCodeLanguage = useCallback(() => {
    if (!editor) return "javascript";
    return editor.getAttributes("codeBlock").language || "javascript";
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkInput(false);
    } else {
      const previousUrl = editor.getAttributes("link").href;
      setLinkUrl(previousUrl || "");
      setShowLinkInput(!showLinkInput);
      setTimeout(() => linkInputRef.current?.focus(), 100);
    }
  }, [editor, linkUrl, showLinkInput]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const isActive = (name: string, attrs?: Record<string, string>) => {
    if (!editor) return false;
    return editor.isActive(name, attrs);
  };

  const ToolbarButton = ({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-muted-foreground/20 mx-0.5" />;

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-48 rounded-lg border bg-muted/30">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-background">
      {/* View Mode Tabs */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/20">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === "split" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Pilcrow className="h-3.5 w-3.5" />
            Split
          </button>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {viewMode === "edit" ? "Editing mode" : viewMode === "preview" ? "Preview mode" : "Split view"}
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b bg-muted/10">
        <ToolbarButton onClick={undo} title="Undo"><Undo className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={redo} title="Redo"><Redo className="h-4 w-4" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={toggleBold} active={isActive("bold")} title="Bold (Ctrl+B)"><Bold className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={toggleItalic} active={isActive("italic")} title="Italic (Ctrl+I)"><Italic className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={toggleHighlight} active={isActive("highlight")} title="Highlight"><Highlighter className="h-4 w-4" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={toggleHeading1} active={isActive("heading", { level: "1" })} title="Heading 1"><Heading1 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={toggleHeading2} active={isActive("heading", { level: "2" })} title="Heading 2"><Heading2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={toggleHeading3} active={isActive("heading", { level: "3" })} title="Heading 3"><Heading3 className="h-4 w-4" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={toggleBulletList} active={isActive("bulletList")} title="Bullet List"><List className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={toggleOrderedList} active={isActive("orderedList")} title="Ordered List"><ListOrdered className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={toggleBlockquote} active={isActive("blockquote")} title="Blockquote"><Quote className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={toggleCodeBlock} active={isActive("codeBlock")} title="Code Block"><Code className="h-4 w-4" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={addLink} active={isActive("link")} title="Link"><Link className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={addImage} title="Image"><Image className="h-4 w-4" /></ToolbarButton>
      </div>

      {/* Code Language Selector (shown when inside a code block) */}
      {isActive("codeBlock") && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/10" ref={codeLangPickerRef}>
          <Code className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Language:</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCodeLangPicker(!showCodeLangPicker)}
              className="flex items-center gap-1.5 px-2 py-1 rounded border bg-background text-xs font-mono hover:border-ring transition-colors"
            >
              {CODE_LANGUAGES.find(l => l.id === getCurrentCodeLanguage())?.label || "JavaScript"}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showCodeLangPicker && (
              <div className="absolute top-full left-0 mt-1 z-50 w-40 max-h-48 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                {CODE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setCodeLanguage(lang.id)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors hover:bg-accent ${
                      getCurrentCodeLanguage() === lang.id
                        ? "text-primary bg-primary/10"
                        : "text-popover-foreground"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground ml-auto">Set language for syntax highlighting</span>
        </div>
      )}

      {/* Link Input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/10">
          <Link className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addLink(); if (e.key === "Escape") setShowLinkInput(false); }}
            placeholder="https://example.com"
            className="flex-1 h-7 px-2 rounded border bg-background text-xs outline-none focus:ring-1 focus:ring-primary"
          />
          <button type="button" onClick={addLink} className="px-2 py-1 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90">
            Apply
          </button>
          <button type="button" onClick={() => setShowLinkInput(false)} className="px-2 py-1 text-xs font-medium rounded text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
      )}

      {/* Editor / Preview Area */}
      <div className={viewMode === "split" ? "grid grid-cols-2 divide-x" : ""}>
        {(viewMode === "edit" || viewMode === "split") && (
          <div className="relative" style={{ minHeight }}>
            <EditorContent editor={editor} className="h-full" />
          </div>
        )}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className="prose prose-sm dark:prose-invert max-w-none p-4 overflow-y-auto bg-muted/5"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
          />
        )}
      </div>

      {/* Character Count */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t bg-muted/10 text-xs text-muted-foreground">
        <span>{editor.getText().length} characters</span>
        <span className="font-mono">TipTap Editor</span>
      </div>
    </div>
  );
}
