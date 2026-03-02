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
    <div className="rounded-xl border bg-white">
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
          {safeRows.map((row) => (
            <Tr key={row.categoryName}>
              <Td>{row.categoryName}</Td>
              <Td>{(row.percentRaw * 100).toFixed(2)}%</Td>
              <Td>{(row.percentNormalized * 100).toFixed(2)}%</Td>
              <Td>{formatAud(row.amount)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
