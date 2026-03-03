'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, FolderKanban, PlusSquare, Settings, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/projects/new', label: 'New Estimate', icon: PlusSquare },
  { href: '/settings', label: 'Settings', icon: Settings, adminOnly: true }
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { data } = useSession();

  if (path === '/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">BUILDANA</p>
          <h1 className="mt-1 text-lg font-semibold">Cost Engine</h1>
          <Separator />
          <nav className="mt-4 space-y-2">
            {navItems
              .filter((item) => !item.adminOnly || data?.user.role === 'ADMIN')
              .map((item) => {
                const Icon = item.icon;
                const active = path.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${active ? 'bg-[#FFC700]/20 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-100'}`}>
                    <Icon className="h-4 w-4" /> {item.label}
                  </Link>
                );
              })}
          </nav>
        </aside>
        <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 p-4">
            <Input
              placeholder="Search projects..."
              className="max-w-md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = (e.target as HTMLInputElement).value;
                  router.push(`/projects?q=${encodeURIComponent(q)}`);
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Badge className="bg-zinc-900 text-white">{data?.user.role ?? 'USER'}</Badge>
              <Button type="button" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-4 md:p-6">
            {children}
          </motion.div>
        </section>
      </div>
    </div>
  );
}
