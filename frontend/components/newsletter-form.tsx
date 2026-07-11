"use client";

import { useState } from "react";
import { Mail, Check, Loader2, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [storedEmail, setStoredEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStoredEmail(email);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.subscriber?.verificationSent) {
          setNeedsVerification(true);
          toast({
            title: "Check your inbox!",
            description: "We sent a confirmation email. Please click the link to verify.",
          });
        } else {
          setSuccess(true);
          toast({
            title: "Subscribed!",
            description: "Thank you for subscribing to our newsletter.",
          });
        }
        setEmail("");
      } else {
        throw new Error(data.error || "Failed to subscribe");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="terminal-window">
        <div className="terminal-titlebar">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="terminal-title">status — pending</span>
        </div>
        <div className="terminal-body text-center py-6">
          <Inbox className="h-10 w-10 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-bold font-mono">
            <span className="text-primary">$</span> Check Your Inbox
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            We sent a confirmation email to <strong>{storedEmail}</strong>.
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Click the link in the email to confirm your subscription.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="terminal-window">
        <div className="terminal-titlebar">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="terminal-title">status — success</span>
        </div>
        <div className="terminal-body text-center py-6">
          <Check className="h-10 w-10 text-terminal-text mx-auto mb-3" />
          <h3 className="text-lg font-bold font-mono">
            <span className="text-terminal-text">✓</span> You&apos;re subscribed!
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Thank you for subscribing to our newsletter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-window">
      <div className="terminal-titlebar">
        <span className="terminal-dot red" />
        <span className="terminal-dot yellow" />
        <span className="terminal-dot green" />
        <span className="terminal-title">newsletter.sh</span>
      </div>
      <div className="terminal-body">
        <p className="terminal-line text-sm mb-1">
          <span className="prompt">$</span>
          <span className="cmd">Subscribe to our Newsletter</span>
        </p>
        <p className="text-xs text-muted-foreground mb-4 font-mono">
          Get the latest articles and insights delivered to your inbox
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            className="flex-1 font-mono text-sm"
          />
          <button type="submit" disabled={loading} className="terminal-btn primary justify-center">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {loading ? "./processing..." : "./subscribe"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground mt-3 font-mono">
          <span className="text-terminal-text">✓</span> We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}