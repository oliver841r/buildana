import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(2,6,23,0.06)]', className)}>
      {children}
    </div>
  );
}
