import { Terminal } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      content: `We collect information you provide directly to us, including name and email address when you subscribe to our newsletter or contact us. We also automatically collect certain technical information when you visit our website, including IP address, browser type, operating system, and pages visited.`,
    },
    {
      title: "How We Use Your Information",
      content: `Your information is used to provide and improve our services, send newsletters and updates (with your consent), respond to your inquiries, analyze website usage, and comply with legal obligations.`,
    },
    {
      title: "Data Protection",
      content: `We implement industry-standard security measures including encryption, secure socket layer (SSL) technology, and regular security audits to protect your personal information from unauthorized access, alteration, disclosure, or destruction.`,
    },
    {
      title: "Cookies",
      content: `We use essential cookies for website functionality and analytics cookies to understand usage patterns. You can control cookie preferences through your browser settings. We do not use cookies for targeted advertising.`,
    },
    {
      title: "Third-Party Services",
      content: `We may use trusted third-party services for analytics and infrastructure. These providers are contractually bound to protect your data and use it only for the services we've engaged them for.`,
    },
    {
      title: "Your Rights",
      content: `You have the right to access, correct, or delete your personal data at any time. You can unsubscribe from communications at any time. To exercise these rights, contact us at privacy@premiumblog.com.`,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.04),transparent_60%)]" />
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="mx-auto max-w-3xl">
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">sh — privacy_policy.sh</span>
              </div>
              <div className="terminal-body space-y-3">
                <p className="terminal-line text-sm">
                  <span className="prompt">$</span>
                  <span className="path">~/premiumblog</span>
                  <span className="text-muted-foreground">/legal/</span>
                </p>
                <p className="terminal-line text-sm">
                  <span className="prompt">$</span>
                  <span className="cmd">cat ./privacy_policy.md --no-header</span>
                </p>
                <hr className="terminal-divider" />
                <h1 className="text-2xl md:text-3xl font-bold font-mono">
                  Privacy <span className="text-terminal-text">Policy</span>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground font-mono">
                  <span className="text-terminal-text">#</span> Last updated: July 10, 2026. Your privacy matters to us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 md:px-6 max-w-3xl pb-16 md:pb-20">
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot green" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot red" />
            <span className="terminal-title">cat policy_sections.conf</span>
            <span className="terminal-title-right">sections: {sections.length}</span>
          </div>
          <div className="terminal-body">
            <p className="terminal-line text-xs mb-6">
              <span className="prompt">$</span>
              <span className="cmd">for i in ./sections/*; do echo $i; done</span>
            </p>
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="group">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-lg border border-border bg-muted/50 text-xs font-mono text-terminal-prompt">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h2 className="terminal-line text-sm font-semibold mb-2">
                        <span className="prompt">$</span>
                        <span className="cmd">{section.title}</span>
                      </h2>
                      <p className="text-xs text-muted-foreground leading-relaxed font-mono">{section.content}</p>
                    </div>
                  </div>
                  {index < sections.length - 1 && (
                    <hr className="terminal-divider ml-11" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">contact.sh</span>
          </div>
          <div className="terminal-body">
            <p className="terminal-line text-xs">
              <span className="prompt text-terminal-prompt">$</span>
              <span className="text-muted-foreground">Have questions about our privacy policy? </span>
              <a href="/contact" className="text-terminal-text hover:underline">Contact our privacy team</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}