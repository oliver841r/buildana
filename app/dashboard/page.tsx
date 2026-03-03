import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { requireAuth } from '@/lib/auth/options';
import { listProjects } from '@/app/actions/projectActions';
import { formatAud } from '@/lib/utils/currency';
import { ChartPanel } from '@/components/layout/ChartPanel';
import { EstimateOutput } from '@/lib/engine/calculate';

export default async function DashboardPage() {
  await requireAuth();
  const projects = await listProjects();
  const enriched = projects.map((project) => ({ ...project, estimate: project.totals as EstimateOutput }));

  const totalPipeline = enriched.reduce((acc, project) => acc + project.estimate.total, 0);
  const averageMargin = enriched.length > 0 ? enriched.reduce((acc, project) => acc + project.marginPercent * 100, 0) / enriched.length : 0;
  const warningsCount = enriched.reduce((acc, project) => acc + project.estimate.warnings.length, 0);
  const attentionNeeded = enriched.filter((project) => project.estimate.warnings.length > 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Buildana Command Centre</p>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
        <div className="space-x-2">
          <Link href="/projects/new"><Button>New Project</Button></Link>
          <Link href="/projects"><Button className="bg-[#FFC700] text-zinc-950 hover:bg-[#e6b400]">Open Projects</Button></Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-xs text-zinc-500">Active Projects</p><p className="text-2xl font-bold">{projects.length}</p></Card>
        <Card><p className="text-xs text-zinc-500">Total Pipeline</p><p className="text-2xl font-bold">{formatAud(totalPipeline)}</p></Card>
        <Card><p className="text-xs text-zinc-500">Average Margin %</p><p className="text-2xl font-bold">{averageMargin.toFixed(1)}%</p></Card>
        <Card><p className="text-xs text-zinc-500">Warnings Count</p><p className="text-2xl font-bold">{warningsCount}</p></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-zinc-200 p-4"><p className="font-semibold">Attention Needed</p></div>
          <div className="divide-y divide-zinc-200">
            {attentionNeeded.length === 0 ? <p className="p-4 text-sm text-zinc-500">No warnings. Great health across portfolio.</p> : null}
            {attentionNeeded.map((project) => (
              <Link className="block p-4 hover:bg-zinc-50" href={`/projects/${project.id}`} key={project.id}>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{project.name}</p>
                  <Badge className="bg-amber-100 text-amber-900">{project.estimate.warnings.length} warnings</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>
        <ChartPanel projects={enriched.map((project) => ({ name: project.name, marginPercent: project.marginPercent }))} />
      </div>
    </div>
  );
}
