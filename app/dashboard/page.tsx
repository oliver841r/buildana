import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { requireAuth } from '@/lib/auth/options';
import { listProjects } from '@/app/actions/projectActions';
import { formatAud } from '@/lib/utils/currency';

export default async function DashboardPage() {
  await requireAuth();
  const projects = await listProjects();
  const totalPipeline = projects.reduce((acc, project) => acc + ((project.totals as any).total ?? 0), 0);
  const averageProject = projects.length ? totalPipeline / projects.length : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Buildana Command Centre</p>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
        <div className="space-x-2">
          <Link href="/projects/new"><Button>New Project</Button></Link>
          <Link href="/settings"><Button className="bg-amber-500 text-zinc-950 hover:bg-amber-400">Settings</Button></Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card><p className="text-xs text-zinc-500">Projects</p><p className="text-2xl font-bold">{projects.length}</p></Card>
        <Card><p className="text-xs text-zinc-500">Total Pipeline</p><p className="text-2xl font-bold">{formatAud(totalPipeline)}</p></Card>
        <Card><p className="text-xs text-zinc-500">Average Project</p><p className="text-2xl font-bold">{formatAud(averageProject)}</p></Card>
        <Card><p className="text-xs text-zinc-500">Last Updated</p><p className="text-2xl font-bold">{projects[0]?.updatedAt.toLocaleDateString() ?? '-'}</p></Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="border-b border-zinc-200 p-4">
          <p className="font-semibold">Active Projects</p>
        </div>
        <div className="divide-y divide-zinc-200">
          {projects.map((project) => (
            <Link className="block p-4 transition hover:bg-zinc-50" href={`/projects/${project.id}`} key={project.id}>
              <div className="flex flex-wrap items-center justify-between gap-1">
                <p className="font-medium">{project.name}</p>
                <p className="font-semibold">{formatAud((project.totals as any).total ?? 0)}</p>
              </div>
              <p className="text-sm text-zinc-500">{project.buildType} · {(project.totals as any)?.roomConfiguration?.bedroomCount ?? 4} bed / {(project.totals as any)?.roomConfiguration?.bathroomCount ?? 2} bath</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
