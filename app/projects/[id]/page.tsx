import { notFound } from 'next/navigation';
import { exportPdf, getProject, updateProject } from '@/app/actions/projectActions';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { requireAuth } from '@/lib/auth/options';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  await requireAuth();
  const project = await getProject(params.id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-6xl p-6">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-zinc-500">Estimator Workspace</p>
      <h1 className="mb-4 text-3xl font-semibold">Edit Project</h1>
      <ProjectForm
        initial={{
          projectName: project.name,
          buildType: project.buildType,
          totalSqm: project.totalSqm,
          specLevel: project.specLevel,
          siteComplexity: project.siteComplexity,
          addOns: project.addOns as any,
          prelimPercent: project.prelimPercent,
          marginPercent: project.marginPercent,
          bedroomCount: (project.totals as any)?.roomConfiguration?.bedroomCount ?? 4,
          bathroomCount: (project.totals as any)?.roomConfiguration?.bathroomCount ?? 2,
          garageSpaces: (project.totals as any)?.roomConfiguration?.garageSpaces ?? 2,
          storeys: (project.totals as any)?.roomConfiguration?.storeys ?? 1
        }}
        onSave={async (data) => {
          'use server';
          await updateProject(project.id, data);
        }}
        onExport={async () => {
          'use server';
          return exportPdf(project.id);
        }}
      />
    </div>
  );
}
