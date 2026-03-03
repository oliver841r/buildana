import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700', className)}>{children}</span>;
}
