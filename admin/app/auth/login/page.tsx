"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, LogIn, Loader2, Terminal, ChevronRight, Key, Mail, Shield, BookOpen, BarChart3 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bootPhase, setBootPhase] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const fullTypedText = "Authenticate to initialize admin shell...";

  // Boot animation sequence
  useEffect(() => {
    const bootMessages = [
      "SYSTEM INITIALIZING...",
      "LOADING SECURITY MODULES...",
      "ESTABLISHING SECURE CONNECTION...",
      "READY."
    ];

    let currentPhase = 0;
    const phaseInterval = setInterval(() => {
      currentPhase++;
      setBootPhase(currentPhase);
      if (currentPhase >= bootMessages.length) {
        clearInterval(phaseInterval);
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          charIndex++;
          setTypedText(fullTypedText.slice(0, charIndex));
          if (charIndex >= fullTypedText.length) {
            clearInterval(typeInterval);
            setTimeout(() => setFormVisible(true), 300);
          }
        }, 25);
        phaseIntervals.push(typeInterval);
      }
    }, 350);

    const phaseIntervals: ReturnType<typeof setInterval>[] = [phaseInterval];

    return () => {
      phaseIntervals.forEach(clearInterval);
    };
  }, []);

  // Focus email input when form appears
  useEffect(() => {
    if (formVisible && emailRef.current) {
      emailRef.current.focus();
    }
  }, [formVisible]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        window.location.href = "/dashboard";
      } else {
        setError("auth/access-denied: Invalid credentials");
      }
    } catch {
      setError("auth/connection-failed: Network error");
    } finally {
      setLoading(false);
    }
  };

  const bootMessages = [
    "SYSTEM INITIALIZING...",
    "LOADING SECURITY MODULES...",
    "ESTABLISHING SECURE CONNECTION...",
    "READY."
  ];

  return (
    <div className="flex min-h-screen bg-terminal-bg overflow-hidden relative">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Scanning line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="w-full h-20 bg-white absolute animate-scan" />
      </div>

      <div className="flex w-full items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-4xl">
          {/* Terminal Window */}
          <div className="terminal-window animate-fade-in">
            {/* Title Bar */}
            <div className="terminal-titlebar">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <Terminal className="h-3.5 w-3.5 text-terminal-prompt ml-2" />
              <span className="terminal-title">premium-admin</span>
              <span className="terminal-title-right text-terminal-text font-bold text-[8px] tracking-[0.15em]">
                AUTH:LOGIN
              </span>
            </div>

            {/* Terminal Body */}
            <div className="terminal-body p-6 md:p-10">
              <div className="max-w-2xl mx-auto">
                {/* ASCII Art Header */}
                <div className="ascii-art text-center mb-8 select-none hidden md:block">
                  <pre className="text-[6px] md:text-[7px] leading-[1.1] text-terminal-text/40">
{` ╔═══╗╔═══╗╔═══╗╔═══╗╔╗──╔╗╔═══╗╔═══╗╔══╗╔═══╗
 ╚══╗║║╔══╝║╔═╗║║╔═╗║║║──║║║╔══╝║╔══╝╚╣╠╝║╔═╗║
 ──╔╝║║╚══╗║╚═╝║║╚═╝║║╚╗╔╝║║╚══╗║╚══╗─║║─║╚═╝║
 ─╔╝╔╝║╔══╝║╔╗╔╝║╔╗╔╝║╚╗╚╝║║╔══╝║╔══╝─║║─║╔╗╔╝
 ╔╝╔╝─║╚══╗║║║╚╗║║║╚╗║╚╗╔╝║║╚══╗║╚══╗╔╣╠╗║║║╚╗
 ╚═╝──╚═══╝╚╝╚═╝╚╝╚═╝╚═╝╚═╝╚═══╝╚═══╝╚══╝╚╝╚═╝`}
                  </pre>
                </div>

                {/* Boot Sequence */}
                <div className="mb-6 font-mono text-xs space-y-1.5">
                  {bootMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`terminal-line text-xs transition-all duration-500 ${
                        bootPhase > i
                          ? "opacity-100"
                          : bootPhase === i
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <span className="text-terminal-text w-3 shrink-0">$</span>
                      <span className={`${bootPhase > i ? "text-terminal-text" : "text-muted-foreground"}`}>
                        {msg}
                      </span>
                      {bootPhase === i && bootPhase < bootMessages.length - 1 && (
                        <span className="terminal-cursor inline-block w-2 h-4 bg-terminal-text ml-0.5" />
                      )}
                    </div>
                  ))}

                  {bootPhase >= bootMessages.length && (
                    <div className="terminal-line text-xs">
                      <span className="text-terminal-text w-3 shrink-0">$</span>
                      <span className="text-terminal-prompt">
                        auth/login.sh
                      </span>
                      <span className="text-muted-foreground ml-1">--secure --tls=1.3</span>
                    </div>
                  )}
                </div>

                {/* Typing Effect Line */}
                {bootPhase >= bootMessages.length && (
                  <div className="terminal-line text-xs md:text-sm mb-6 py-3 px-4 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-terminal-prompt shrink-0">{">"}</span>
                    <span className="text-terminal-text ml-2">{typedText}</span>
                    {!formVisible && <span className="terminal-cursor inline-block w-2 h-4 bg-terminal-text ml-0.5" />}
                  </div>
                )}

                {/* Login Form */}
                {formVisible && (
                  <div className="animate-fade-in">
                    <form onSubmit={handleLogin} className="space-y-4">
                      {/* Error Message */}
                      {error && (
                        <div className="terminal-line text-xs p-3 rounded-lg border border-destructive/30 bg-destructive/10">
                          <span className="text-red-500 shrink-0">!</span>
                          <span className="text-red-400 ml-2 font-mono">{error}</span>
                        </div>
                      )}

                      {/* Email field */}
                      <div className="space-y-1.5">
                        <div className="terminal-line text-xs">
                          <span className="text-terminal-prompt shrink-0">$</span>
                          <span className="text-muted-foreground ml-2">Enter your email address:</span>
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            ref={emailRef}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@premiumblog.com"
                            className="terminal-input pl-9 text-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* Password field */}
                      <div className="space-y-1.5">
                        <div className="terminal-line text-xs">
                          <span className="text-terminal-prompt shrink-0">$</span>
                          <span className="text-muted-foreground ml-2">Enter your password:</span>
                        </div>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                            className="terminal-input pl-9 pr-10 text-sm"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="terminal-btn w-full justify-center text-sm font-semibold py-3 mt-2"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="terminal-cursor inline-block w-2 h-4 bg-terminal-text ml-1" />
                              Authenticating...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <LogIn className="h-4 w-4 text-terminal-prompt" />
                              <span className="text-terminal-prompt">$</span>
                              ./authenticate.sh
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Feature List */}
                    <div className="mt-6 p-4 rounded-lg border border-border/50 bg-muted/20">
                      <div className="terminal-line text-[10px] mb-3">
                        <span className="text-terminal-text shrink-0">#</span>
                        <span className="text-terminal-text ml-2 font-semibold tracking-wider">SYSTEM CAPABILITIES</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { icon: Shield, text: "Secure, role-based access" },
                          { icon: BookOpen, text: "Draft, schedule & publish" },
                          { icon: BarChart3, text: "Built-in analytics & SEO" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                            <item.icon className="h-3 w-3 text-terminal-text shrink-0" />
                            <span>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom status bar */}
                <div className="mt-8 pt-4 border-t border-border/30 flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                  <span>
                    <span className="text-terminal-text">◆</span> CONNECTION: SECURE (TLS 1.3)
                  </span>
                  <span>
                    SESSION: <span className="text-terminal-prompt">NEW</span>
                  </span>
                  <span className="hidden sm:inline">
                    <span className="text-terminal-text">●</span> v2.1.0
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for scanning line animation */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
