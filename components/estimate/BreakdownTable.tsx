import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/table';
import { formatAud } from '@/lib/utils/currency';

export type BreakdownRow = {
  categoryName: string;
  percentRaw: number;
  percentNormalized: number;
  amount: number;
};

type Props = {
  rows?: BreakdownRow[];
};

export function BreakdownTable({ rows }: Props) {
  const safeRows = rows ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_30px_rgba(2,6,23,0.06)]">
      <Table>
        <THead>
          <Tr>
            <Th>Category</Th>
            <Th>Raw %</Th>
            <Th>Normalized %</Th>
            <Th>Amount</Th>
          </Tr>
        </THead>
        <TBody>
          {safeRows.length === 0 ? (
            <Tr>
              <Td colSpan={4} className="text-center text-zinc-500">No breakdown available yet.</Td>
            </Tr>
          ) : (
            safeRows.map((row) => (
              <Tr key={row.categoryName}>
                <Td>{row.categoryName}</Td>
                <Td>{(row.percentRaw * 100).toFixed(2)}%</Td>
                <Td>{(row.percentNormalized * 100).toFixed(2)}%</Td>
                <Td className="font-medium">{formatAud(row.amount)}</Td>
              </Tr>
            ))
          )}
        </TBody>
      </Table>
    </div>
  );
}
