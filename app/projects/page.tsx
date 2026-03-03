import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/options';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatAud } from '@/lib/utils/currency';

export default async function ProjectsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  await requireAuth();
  const q = (searchParams.q as string) ?? '';
  const buildType = (searchParams.buildType as string) || undefined;
  const specLevel = (searchParams.specLevel as string) || undefined;
  const status = (searchParams.status as string) || undefined;
  const warningOnly = (searchParams.warningOnly as string) === '1';
  const sort = (searchParams.sort as string) || 'updatedAt';

  const projects = await prisma.project.findMany({
    where: {
      name: { contains: q, mode: 'insensitive' },
      ...(buildType ? { buildType: buildType as any } : {}),
      ...(specLevel ? { specLevel: specLevel as any } : {}),
      ...(status ? { status: status as any } : {})
    },
    orderBy:
      sort === 'totalCost'
        ? { totals: 'desc' as any }
        : sort === 'marginPercent'
          ? { marginPercent: 'desc' }
          : { updatedAt: 'desc' }
  });

  const filtered = warningOnly ? projects.filter((p) => (((p.totals as any)?.warnings ?? []) as string[]).length > 0) : projects;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Projects</h1>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="p-3">Project</th>
              <th className="p-3">Type</th>
              <th className="p-3">Spec</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Warnings</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr key={project.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                <td className="p-3"><Link href={`/projects/${project.id}`} className="font-medium hover:underline">{project.name}</Link></td>
                <td className="p-3">{project.buildType}</td>
                <td className="p-3">{project.specLevel}</td>
                <td className="p-3"><Badge>{project.status}</Badge></td>
                <td className="p-3 font-medium">{formatAud((project.totals as any)?.total ?? 0)}</td>
                <td className="p-3 text-amber-700">{((project.totals as any)?.warnings ?? []).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
