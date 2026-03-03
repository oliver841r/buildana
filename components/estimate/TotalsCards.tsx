import { Card } from '@/components/ui/card';
import { formatAud } from '@/lib/utils/currency';

export function TotalsCards({
  total,
  subtotal,
  prelim,
  margin,
  gst = 0,
  discount = 0,
  escalation = 0,
  contingency = 0
}: {
  total: number;
  subtotal: number;
  prelim: number;
  margin: number;
  gst?: number;
  discount?: number;
  escalation?: number;
  contingency?: number;
}) {
  const items = [
    { label: 'Total Estimate', value: total },
    { label: 'Subtotal', value: subtotal },
    { label: 'Preliminaries', value: prelim },
    { label: 'Margin', value: margin },
    { label: 'GST', value: gst },
    { label: 'Discount', value: -discount },
    { label: 'Escalation', value: escalation },
    { label: 'Contingency', value: contingency }
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
