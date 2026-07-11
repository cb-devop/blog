import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { NewsletterSection } from "@/components/newsletter-section";
import { TypingText, MatrixRain } from "@/components/home-animations";
import { FeaturedPosts } from "@/components/featured-posts";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Matrix Rain Background */}
      <MatrixRain />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.04),transparent_60%)]" />
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">bash — welcome.sh</span>
                <span className="terminal-title-right">80x24</span>
              </div>
              <div className="terminal-body space-y-3 md:p-8 p-4">
                {/* Mobile-friendly ASCII art - hidden on very small, visible from sm up */}
                <pre className="ascii-art text-center leading-tight hidden sm:block text-[0.4rem] md:text-[0.6rem]">{`
  ╔══════════════════════════════════════╗
  ║  ___  ___ _ __ ___  _ __ ___  _ __  ║
  ║ / __|/ _ \\ |_ _/ _ \\| \\_ _/ _ \\|   \\ ║
  ║ \\__ \\  __/ | | \\_  \\ | | \\_  \\ | | | ║
  ║ |___/\\___|_|___\\___/|_|___\\___/|_| |_|║
  ╚══════════════════════════════════════╝
                `}</pre>

                {/* Small screen logo - simple text */}
                <p className="text-center text-terminal-prompt font-bold font-mono text-lg sm:hidden">
                  PremiumBlog v1.0
                </p>

                {/* Animated typing commands */}
                <div className="space-y-2 min-h-[120px]">
                  <p className="terminal-line text-xs md:text-sm lg:text-base">
                    <span className="prompt">$</span>
                    <span className="text-terminal-text">~/premiumblog</span>
                    <span className="text-muted-foreground"> on </span>
                    <span className="text-terminal-prompt">branch main</span>
                    <span className="text-muted-foreground"> is </span>
                    <span className="text-green-500">OK</span>
                  </p>
                  <p className="terminal-line text-xs md:text-sm lg:text-base">
                    <span className="prompt">$</span>
                    <span className="cmd">cat welcome.txt</span>
                  </p>
                  <TypingText
                    lines={[
                      "Welcome to PremiumBlog - where ideas meet innovation.",
                      "Discover insightful articles about web development, design, and technology.",
                    ]}
                    speed={25}
                  />
                  <p className="terminal-line text-xs md:text-sm lg:text-base opacity-0 animate-fade-in" style={{ animationDelay: "4s", animationFillMode: "forwards" }}>
                    <span className="prompt">$</span>
                    <span className="cmd">ls ./articles/ | head -6</span>
                  </p>
                </div>

                <hr className="terminal-divider opacity-0 animate-fade-in" style={{ animationDelay: "4.8s", animationFillMode: "forwards" }} />
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 opacity-0 animate-fade-in" style={{ animationDelay: "5s", animationFillMode: "forwards" }}>
                  <Link
                    href="/blog"
                    className="terminal-btn primary justify-center flex-1 text-xs md:text-sm"
                  >
                    <Terminal className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    ./explore_articles.sh
                    <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Link>
                  <Link
                    href="/about"
                    className="terminal-btn justify-center flex-1 text-xs md:text-sm"
                  >
                    cat ./about
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts — dynamically fetched from admin API */}
      <FeaturedPosts />

      {/* Newsletter */}
      <div className="relative z-10">
        <NewsletterSection />
      </div>
    </div>
  );
}
