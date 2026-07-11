import Link from "next/link";
import { Terminal, ChevronRight, ArrowRight, Users, Target, Heart } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Articles Published", value: "50+" },
    { label: "Monthly Readers", value: "10K+" },
    { label: "Subscribers", value: "3,000+" },
    { label: "Years Active", value: "3+" },
  ];

  const values = [
    {
      icon: Target,
      title: "Quality First",
      description: "We publish only well-researched, high-quality content that provides real value to our readers.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Our content is shaped by the needs and feedback of our amazing community of developers and makers.",
    },
    {
      icon: Heart,
      title: "Passion for Tech",
      description: "Every article is written with genuine passion for technology and a desire to share knowledge.",
    },
  ];

  const team = [
    { name: "John Doe", role: "Senior Full-Stack Developer", initial: "JD" },
    { name: "Jane Smith", role: "Frontend Developer & CSS Enthusiast", initial: "JS" },
    { name: "Mike Johnson", role: "Backend Developer & API Architect", initial: "MJ" },
    { name: "Sarah Wilson", role: "Full-Stack Developer & TypeScript Advocate", initial: "SW" },
    { name: "Emily Davis", role: "UI/UX Designer & Design Systems Specialist", initial: "ED" },
    { name: "Alex Chen", role: "Tech Writer & Full-Stack Developer", initial: "AC" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.04),transparent_60%)]" />
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="mx-auto max-w-3xl">
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">bash — about.sh</span>
                <span className="terminal-title-right">--verbose</span>
              </div>
              <div className="terminal-body space-y-3">
                <pre className="ascii-art leading-tight hidden md:block">{`
    ╔══════════════════════════════════════════════════════╗
    ║     _   __                   __  _ _                ║
    ║    / | / /_  _ __ ___   ___ /__// / (_)___  ___     ║
    ║   /  |/ / / / /  __/  / __ \\__// __// /_  / / _ \\   ║
    ║  / /|  / /_/ / /     / /_/ / / / /_ / / / /_/  __/  ║
    ║ /_/ |_/\\__,_/_/      \\____/ /  \\__//_/ /___/\\___/  ║
    ║                           /_/                        ║
    ╚══════════════════════════════════════════════════════╝
                `}</pre>
                <p className="terminal-line text-sm">
                  <span className="prompt">$</span>
                  <span className="cmd">cat ./about/mission.txt</span>
                </p>
                <div className="border-l-2 border-terminal-text/30 pl-4 py-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-mono mb-3">
                    Our mission is to make web development knowledge accessible to everyone
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We believe in the power of sharing knowledge. Our team of experienced developers 
                    creates in-depth tutorials, insightful articles, and practical guides to help you 
                    stay ahead in the ever-evolving world of web development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 md:px-6 max-w-5xl pb-12 md:pb-16">
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot green" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot red" />
            <span className="terminal-title">stats.sh — metrics</span>
          </div>
          <div className="terminal-body">
            <p className="terminal-line text-xs mb-4">
              <span className="prompt">$</span>
              <span className="cmd">./collect_metrics.sh --all</span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-lg border border-border bg-muted/30">
                  <p className="text-2xl md:text-3xl font-bold font-mono text-terminal-text">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 md:px-6 max-w-5xl pb-12 md:pb-16">
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">values.conf</span>
          </div>
          <div className="terminal-body">
            <p className="terminal-line text-xs mb-4">
              <span className="prompt">$</span>
              <span className="cmd">cat ./config/values.conf</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {values.map((value) => (
                <div key={value.title} className="terminal-window">
                  <div className="terminal-titlebar">
                    <span className="terminal-dot green" />
                    <span className="terminal-dot yellow" />
                    <span className="terminal-dot red" />
                    <span className="terminal-title truncate">{value.title.toLowerCase().replace(/\s+/g, "_")}.sh</span>
                  </div>
                  <div className="terminal-body text-center">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <value.icon className="h-5 w-5 text-terminal-prompt" />
                    </div>
                    <h3 className="text-sm font-bold font-mono text-foreground mb-2">{value.title}</h3>
                    <p className="text-xs text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 md:px-6 max-w-5xl pb-12 md:pb-16">
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot green" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot red" />
            <span className="terminal-title">team — members</span>
          </div>
          <div className="terminal-body">
            <p className="terminal-line text-xs mb-4">
              <span className="prompt">$</span>
              <span className="cmd">ls ./team/ | grep -v &quot;^_&quot;</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {team.map((member) => (
                <div key={member.name} className="terminal-window">
                  <div className="terminal-titlebar">
                    <span className="terminal-dot blue" />
                    <span className="terminal-dot yellow" />
                    <span className="terminal-dot green" />
                    <span className="terminal-title truncate font-mono">{member.initial.toLowerCase()}.sh</span>
                  </div>
                  <div className="terminal-body text-center">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-lg font-bold font-mono text-terminal-prompt">{member.initial}</span>
                    </div>
                    <p className="text-sm font-mono text-foreground">
                      <span className="text-terminal-prompt">@</span>{member.name.toLowerCase().replace(/\s+/g, "_")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 md:px-6 max-w-3xl pb-16 md:pb-20">
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">next_steps.sh</span>
          </div>
          <div className="terminal-body text-center py-6">
            <p className="terminal-line text-sm mb-1 justify-center">
              <span className="prompt">$</span>
              <span className="cmd">echo &quot;Ready to learn something new?&quot;</span>
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Dive into our collection of articles and start your learning journey today.
            </p>
            <Link
              href="/blog"
              className="terminal-btn primary inline-flex"
            >
              <Terminal className="h-4 w-4" />
              ./browse_articles.sh
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}