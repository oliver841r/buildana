import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-xl border border-zinc-200 bg-white p-4 shadow-sm', className)}>{children}</div>;
}
