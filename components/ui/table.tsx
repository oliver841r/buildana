import { ReactNode } from 'react';

export const Table = ({ children }: { children: ReactNode }) => <table className="w-full text-sm">{children}</table>;
export const THead = ({ children }: { children: ReactNode }) => <thead className="bg-zinc-100">{children}</thead>;
export const TBody = ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>;
export const Tr = ({ children }: { children: ReactNode }) => <tr className="border-b">{children}</tr>;
export const Th = ({ children }: { children: ReactNode }) => <th className="p-2 text-left font-semibold">{children}</th>;
export const Td = ({ children }: { children: ReactNode }) => <td className="p-2">{children}</td>;
