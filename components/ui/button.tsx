import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center rounded-md bg-buildana.black px-4 py-2 text-sm font-medium text-buildana.white hover:bg-zinc-800 disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
