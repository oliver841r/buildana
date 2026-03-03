import { Card } from '@/components/ui/card';

export function WarningsBanner({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <Card className="border-yellow-300 bg-yellow-50">
      <p className="font-semibold">Warnings</p>
      <ul className="mt-2 list-disc pl-5">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </Card>
  );
}
