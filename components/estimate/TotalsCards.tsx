import { Card } from '@/components/ui/card';
import { formatAud } from '@/lib/utils/currency';

export function TotalsCards({
  total,
  subtotal,
  prelim,
  margin,
  contingency = 0
}: {
  total: number;
  subtotal: number;
  prelim: number;
  margin: number;
  contingency?: number;
}) {
  const items = [
    { label: 'Total Estimate', value: total },
    { label: 'Subtotal', value: subtotal },
    { label: 'Preliminaries', value: prelim },
    { label: 'Contingency', value: contingency },
    { label: 'Margin', value: margin }
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} className={item.label === 'Total Estimate' ? 'border-[#FFC700] bg-[#FFC700]/15' : ''}>
          <p className="text-xs uppercase tracking-wider text-zinc-500">{item.label}</p>
          <p className="text-2xl font-semibold">{formatAud(item.value)}</p>
        </Card>
      ))}
    </div>
  );
}
