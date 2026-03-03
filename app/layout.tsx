import './globals.css';
import { ReactNode } from 'react';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { AppShell } from '@/components/layout/AppShell';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
