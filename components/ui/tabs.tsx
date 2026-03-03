import { ReactNode } from 'react';

export function Tabs({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
