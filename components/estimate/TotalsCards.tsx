import { Card } from '@/components/ui/card';
import { formatAud } from '@/lib/utils/currency';

export function TotalsCards({
  total,
  subtotal,
  prelim,
  margin
}: {
  total: number;
  subtotal: number;
  prelim: number;
  margin: number;
}) {
  const items = [
    { label: 'Total Estimate', value: total },
    { label: 'Subtotal', value: subtotal },
    { label: 'Preliminaries', value: prelim },
    { label: 'Margin', value: margin }
  ];

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className={item.label === 'Total Estimate' ? 'border-amber-400 bg-amber-50/70' : ''}>
          <p className="text-xs uppercase tracking-wider text-zinc-500">{item.label}</p>
          <p className="text-2xl font-semibold">{formatAud(item.value)}</p>
        </Card>
      ))}
    </div>
  );
}
