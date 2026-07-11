"use client";

import { useState, useEffect } from "react";
import { Mail, Search, Trash2, Eye, EyeOff, MessageSquare, Terminal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/contact");
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || data || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: true }),
      });
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const response = await fetch("/api/contact", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        toast({ title: "Deleted", description: "Message deleted" });
        if (selected?.id === id) setSelected(null);
        fetchMessages();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const filtered = messages.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    (m.subject?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
            <Terminal className="h-3 w-3" />
            <span>~/dashboard/contact</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground font-mono">Contact Messages</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? <span className="text-primary font-medium">{unreadCount} unread</span>
              : "All caught up!"} — {messages.length} total
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-mono text-sm">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
              Loading messages...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-mono text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No messages found
            </div>
          ) : (
            filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => { setSelected(msg); if (!msg.isRead) markAsRead(msg.id); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected?.id === msg.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : !msg.isRead
                    ? "border-l-2 border-l-primary bg-card hover:bg-muted/50"
                    : "border bg-card hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${!msg.isRead ? "font-semibold text-foreground" : "text-foreground"}`}>
                      {msg.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-mono">{msg.email}</p>
                    {msg.subject && (
                      <p className="text-xs text-muted-foreground truncate mt-1">{msg.subject}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!msg.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <Card className="p-6 border">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      <Terminal className="h-3 w-3 inline mr-1" />
                      message/{selected.id.substring(0, 8)}
                    </span>
                    <Badge variant={selected.isRead ? "outline" : "default"} className="text-xs">
                      {selected.isRead ? "Read" : "New"}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-foreground font-mono">
                    <ChevronRight className="h-4 w-4 inline text-primary" />
                    {selected.subject || "No Subject"}
                  </h2>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selected.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 mb-6 font-mono text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="text-foreground font-medium">{selected.name}</p>
                </div>
                <div className="text-muted-foreground">/</div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                </div>
                <div className="text-muted-foreground">/</div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-foreground">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 rounded-lg border bg-card whitespace-pre-wrap text-sm leading-relaxed">
                  {selected.message}
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-30" />
              <p className="font-mono text-sm">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
