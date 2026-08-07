"use client";

import { useState } from "react";
import {
  Mail,
  Send,
  MapPin,
  Clock,
  Check,
  Terminal,
  ChevronRight,
  AtSign,
  GitBranch,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const inputClass =
  "font-mono text-sm h-11 px-4 bg-secondary/40 hover:bg-secondary/60 transition-colors focus-visible:ring-2 focus-visible:ring-ring";
const textareaClass =
  "font-mono text-sm px-4 py-3 bg-secondary/40 hover:bg-secondary/60 transition-colors focus-visible:ring-2 focus-visible:ring-ring";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSent(true);
        toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to send");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: "Email", value: "hello@premiumblog.com" },
    { icon: MapPin, label: "Location", value: "San Francisco, CA" },
    { icon: Clock, label: "Response Time", value: "Within 24 hours" },
  ];

  const socialLinks = [
    { icon: AtSign, label: "Twitter" },
    { icon: GitBranch, label: "GitHub" },
    { icon: Briefcase, label: "LinkedIn" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground font-mono mb-5 bg-muted/50 border border-border rounded-full px-3 py-1.5">
              <Terminal className="h-3 w-3" />
              <span>~/contact</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-primary">new_message.sh</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              <span className="text-gradient font-mono">Get in Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have a question, suggestion, or just want to say hello? Drop us a message.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              {sent ? (
                <div className="terminal-window terminal-window-accent border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.12)]">
                  <div className="terminal-titlebar">
                    <span className="terminal-dot red" />
                    <span className="terminal-dot yellow" />
                    <span className="terminal-dot green" />
                    <span className="terminal-title">status — success</span>
                  </div>
                  <div className="terminal-body text-center py-10">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5 animate-scale-in">
                      <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 font-mono">
                      Message Delivered!
                    </h2>
                    <p className="text-sm text-muted-foreground mb-7">
                      Thank you for reaching out! We'll respond within 24 hours.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="terminal-btn hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                      <Terminal className="h-4 w-4" /> Send another
                    </button>
                  </div>
                </div>
              ) : (
                <div className="terminal-window terminal-window-accent">
                  <div className="terminal-titlebar">
                    <span className="terminal-dot red" />
                    <span className="terminal-dot yellow" />
                    <span className="terminal-dot green" />
                    <span className="terminal-title">contact_form — send_message.sh</span>
                    <span className="terminal-title-right">bash</span>
                    <span className="terminal-cursor" aria-hidden="true" />
                  </div>
                  <form onSubmit={handleSubmit} className="terminal-body space-y-6">
                    <div className="group">
                      <label
                        htmlFor="contact-name"
                        className="text-xs font-mono text-muted-foreground group-focus-within:text-primary transition-colors duration-200 mb-2 block select-none"
                      >
                        <span className="text-primary">$</span> name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="contact-name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="group">
                        <label
                          htmlFor="contact-email"
                          className="text-xs font-mono text-muted-foreground group-focus-within:text-primary transition-colors duration-200 mb-2 block select-none"
                        >
                          <span className="text-primary">$</span> email <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="contact-email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className={inputClass}
                        />
                      </div>
                      <div className="group">
                        <label
                          htmlFor="contact-subject"
                          className="text-xs font-mono text-muted-foreground group-focus-within:text-primary transition-colors duration-200 mb-2 block select-none"
                        >
                          <span className="text-primary">$</span> subject
                        </label>
                        <Input
                          id="contact-subject"
                          name="subject"
                          placeholder="How can we help?"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label
                        htmlFor="contact-message"
                        className="text-xs font-mono text-muted-foreground group-focus-within:text-primary transition-colors duration-200 mb-2 block select-none"
                      >
                        <span className="text-primary">$</span> message <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        id="contact-message"
                        name="message"
                        placeholder="Tell us what's on your mind..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className={textareaClass}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="terminal-btn primary w-full md:w-auto hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-primary/10 hover:shadow-primary/25 transition-all"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {contactInfo.map((info) => (
                <div
                  key={info.label}
                  className="terminal-window terminal-window-accent group transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="terminal-body">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                        <info.icon className="h-4 w-4 text-terminal-prompt transition-transform duration-300 group-hover:rotate-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-muted-foreground">{info.label}</p>
                        <p className="text-sm font-mono text-foreground truncate">{info.value}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="terminal-window terminal-window-accent">
                <div className="terminal-body">
                  <p className="terminal-line text-xs mb-3">
                    <span className="prompt">$</span>
                    <span className="cmd">follow_us.sh</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map(({ icon: Icon, label }) => (
                      <a
                        key={label}
                        href="#"
                        aria-label={label}
                        title={label}
                        className="terminal-btn text-xs hover:-translate-y-0.5 active:translate-y-0 transition-all"
                      >
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
