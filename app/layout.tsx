import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import { SessionProvider } from '@/components/providers/SessionProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <div className="min-h-screen bg-grid">
            <header className="sticky top-0 z-30 border-b border-zinc-900/10 bg-white/90 backdrop-blur">
              <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                <Link href="/dashboard" className="text-sm font-semibold tracking-[0.2em] text-zinc-900">BUILDANA COST ENGINE</Link>
                <nav className="flex items-center gap-4 text-sm text-zinc-600">
                  <Link href="/dashboard" className="hover:text-zinc-900">Dashboard</Link>
                  <Link href="/projects/new" className="hover:text-zinc-900">New Estimate</Link>
                  <Link href="/settings" className="hover:text-zinc-900">Settings</Link>
                </nav>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
