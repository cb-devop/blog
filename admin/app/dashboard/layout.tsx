import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAuth, getTokenFromCookie } from '@/lib/auth';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Blog management system',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const token = headersList.get('authorization')?.split(' ')[1] || 
                getTokenFromCookie(headersList.get('cookie'));

  const user = await verifyAuth(token);

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Header */}
        <Header user={user} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-card py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© 2024 Blog Admin Dashboard. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}