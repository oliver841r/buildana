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

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="space-x-2">
          <Link href="/projects/new"><Button>New Project</Button></Link>
          <Link href="/settings"><Button>Settings</Button></Link>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Card><p>Projects</p><p className="text-2xl font-bold">{projects.length}</p></Card>
        <Card><p>Total Pipeline</p><p className="text-2xl font-bold">{formatAud(totalPipeline)}</p></Card>
        <Card><p>Last Updated</p><p className="text-2xl font-bold">{projects[0]?.updatedAt.toLocaleDateString() ?? '-'}</p></Card>
      </div>
      <Card>
        <p className="mb-3 font-semibold">Projects</p>
        <div className="space-y-2">
          {projects.map((project) => (
            <Link className="block rounded border p-3 hover:bg-zinc-50" href={`/projects/${project.id}`} key={project.id}>
              <div className="flex justify-between">
                <p>{project.name}</p>
                <p>{formatAud((project.totals as any).total ?? 0)}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
