import { Terminal } from "lucide-react";

export default function DisclaimerPage() {
  const sections = [
    {
      title: "General Information",
      content: `The content provided on PremiumBlog is for general informational and educational purposes only. While we strive to keep information accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information contained on our website.`,
    },
    {
      title: "Professional Advice",
      content: `The articles, tutorials, and guides published on this website do not constitute professional advice. You should not act or refrain from acting based on any content on this website without seeking appropriate professional advice specific to your situation. Always consult with qualified professionals regarding your specific circumstances.`,
    },
    {
      title: "External Links",
      content: `Our website may contain links to external websites that are not provided or maintained by us. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.`,
    },
    {
      title: "Code Examples",
      content: `Code examples and snippets provided in our tutorials are for demonstration purposes only. We recommend testing all code in a development environment before deploying to production. We are not responsible for any damages or issues arising from the use of code examples found on this website.`,
    },
    {
      title: "Limitation of Liability",
      content: `In no event shall PremiumBlog or its contributors be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence, or other tort, arising out of or in connection with the use of the website or the contents of the website.`,
    },
    {
      title: "Changes to This Disclaimer",
      content: `We reserve the right to update, amend, or change this disclaimer at any time without prior notice. Your continued use of the website after any changes indicates your acceptance of the updated disclaimer. We encourage you to review this page periodically for any changes.`,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.04),transparent_60%)]" />
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="mx-auto max-w-3xl">
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">sh — disclaimer.sh</span>
              </div>
              <div className="terminal-body space-y-3">
                <p className="terminal-line text-sm">
                  <span className="prompt">$</span>
                  <span className="path">~/premiumblog</span>
                  <span className="text-muted-foreground">/legal/</span>
                </p>
                <p className="terminal-line text-sm">
                  <span className="prompt">$</span>
                  <span className="cmd">cat ./disclaimer.md --show-all</span>
                </p>
                <hr className="terminal-divider" />
                <h1 className="text-2xl md:text-3xl font-bold font-mono">
                  <span className="text-terminal-text">Disclaimer</span>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground font-mono">
                  <span className="text-terminal-prompt">$</span> Last updated: July 10, 2026. Please read this disclaimer carefully.
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
            <span className="terminal-title">cat disclaimer_sections.list</span>
            <span className="terminal-title-right">sections: {sections.length}</span>
          </div>
          <div className="terminal-body">
            <p className="terminal-line text-xs mb-6">
              <span className="prompt text-amber-500">$</span>
              <span className="cmd text-amber-500/80">find ./disclaimer -type f -exec cat {} \;</span>
            </p>
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="group">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-lg border border-border bg-muted/50 text-xs font-mono text-amber-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h2 className="terminal-line text-sm font-semibold mb-2">
                        <span className="prompt text-amber-500">$</span>
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
            <span className="terminal-title">help.sh</span>
          </div>
          <div className="terminal-body">
            <p className="terminal-line text-xs">
              <span className="prompt text-amber-500">$</span>
              <span className="text-muted-foreground">Questions about this disclaimer? </span>
              <a href="/contact" className="text-terminal-text hover:underline">Get in touch</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}