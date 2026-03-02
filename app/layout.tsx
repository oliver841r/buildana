import './globals.css';
import { ReactNode } from 'react';
import { SessionProvider } from '@/components/providers/SessionProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <main className="min-h-screen">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
