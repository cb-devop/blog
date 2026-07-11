import { JetBrains_Mono } from "next/font/google";
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { TerminalOverlay } from "@/components/terminal/TerminalOverlay"
import { MaintenanceGuard } from "@/components/maintenance-guard"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
  fallback: ["Consolas", "Monaco", "monospace"],
});

export const metadata = {
  title: 'PremiumBlog - Web Development & Design Insights',
  description: 'Discover insightful articles about web development, design, and technology. Curated content for builders and creators.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased font-mono">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MaintenanceGuard>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <TerminalOverlay />
          </MaintenanceGuard>
        </ThemeProvider>
      </body>
    </html>
  )
}