import { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export const Table = ({ children }: { children: ReactNode }) => <table className="w-full text-sm">{children}</table>;
export const THead = ({ children }: { children: ReactNode }) => <thead className="bg-zinc-100/70">{children}</thead>;
export const TBody = ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>;
export const Tr = ({ children }: { children: ReactNode }) => <tr className="border-b border-zinc-200">{children}</tr>;
export const Th = ({ children, className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('p-3 text-left font-semibold', className)} {...props}>{children}</th>
);
export const Td = ({ children, className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('p-3', className)} {...props}>{children}</td>
);
