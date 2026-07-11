"use client";

import { useState, useEffect } from "react";
import { Terminal, Mail, Check, Loader2, Inbox, AlertCircle } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [error, setError] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);

  // Check URL params for verification status and clean them up
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verify = params.get("verify");
    if (verify) {
      if (verify === "success") {
        setVerifyStatus("success");
      } else if (verify === "already-verified") {
        setVerifyStatus("already");
      } else if (verify === "invalid" || verify === "missing-token") {
        setVerifyStatus("invalid");
      } else if (verify === "error") {
        setVerifyStatus("error");
      }
      // Clean up URL params without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("verify");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.subscriber?.verificationSent) {
          setSubmittedEmail(email);
          setNeedsVerification(true);
          setEmail("");
        } else {
          setSuccess(true);
          setEmail("");
        }
      } else {
        setError(data.error || "Subscription failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show verification status banner
  if (verifyStatus) {
    return (
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl py-16 md:py-20">
          <div className="mx-auto max-w-xl">
            <div className="terminal-window">
              <div className="terminal-titlebar justify-center">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">verification.sh</span>
              </div>
              <div className="terminal-body px-6 py-8">
                {verifyStatus === "success" && (
                  <>
                    <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2 font-mono text-center">
                      <span className="text-green-500">✓</span> Email Verified!
                    </h2>
                    <p className="text-muted-foreground font-mono text-sm text-center">
                      Thank you for confirming your subscription. You&apos;re now on the list!
                    </p>
                  </>
                )}
                {verifyStatus === "already" && (
                  <>
                    <Check className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2 font-mono text-center">
                      <span className="text-blue-500">✓</span> Already Verified
                    </h2>
                    <p className="text-muted-foreground font-mono text-sm text-center">
                      Your email was already verified. Thanks for being a subscriber!
                    </p>
                  </>
                )}
                {verifyStatus === "invalid" && (
                  <>
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2 font-mono text-center">
                      <span className="text-red-500">✗</span> Invalid Link
                    </h2>
                    <p className="text-muted-foreground font-mono text-sm text-center">
                      This verification link is invalid or has expired. Please try subscribing again.
                    </p>
                  </>
                )}
                {verifyStatus === "error" && (
                  <>
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2 font-mono text-center">
                      <span className="text-red-500">✗</span> Verification Failed
                    </h2>
                    <p className="text-muted-foreground font-mono text-sm text-center">
                      Something went wrong. Please try subscribing again.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-16 md:py-20">
        <div className="mx-auto max-w-xl">
          <div className="terminal-window">
            <div className="terminal-titlebar justify-center">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-title">newsletter.sh</span>
            </div>
            <div className="terminal-body">
              {success ? (
                <div className="px-6 py-8">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2 font-mono text-center">
                    <span className="text-green-500">$</span> You&apos;re subscribed!
                  </h2>
                  <p className="text-muted-foreground font-mono text-sm text-center">
                    Thank you for subscribing to our newsletter. Stay tuned for the latest articles and insights.
                  </p>
                </div>
              ) : needsVerification ? (
                <div className="px-6 py-8">
                  <Inbox className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2 font-mono text-center">
                    <span className="text-primary">$</span> Check Your Inbox
                  </h2>
                  <p className="text-muted-foreground font-mono text-sm text-center">
                    We&apos;ve sent a confirmation email to <strong className="text-foreground">{submittedEmail}</strong>.
                    Click the link in the email to confirm your subscription.
                  </p>
                  <p className="text-xs text-muted-foreground mt-4 font-mono text-center">
                    <span className="text-yellow-500">!</span> Didn&apos;t receive it? Check your spam folder.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-2 font-mono">
                    <span className="text-primary">$</span> Stay connected
                  </h2>
                  <p className="text-muted-foreground mb-6 font-mono text-sm">
                    Subscribe to receive the latest articles directly in your inbox.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 px-6">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 h-11 rounded-xl border border-input bg-background px-4 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground font-mono"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-medium font-mono text-sm shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Terminal className="h-4 w-4" />
                      )}
                      {loading ? "./subscribing.sh" : "./subscribe.sh"}
                    </button>
                  </form>
                  {error && (
                    <p className="text-xs text-red-500 mt-3 font-mono">{error}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-4 font-mono">
                    <span className="text-green-500">✓</span> No spam. Unsubscribe anytime.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
