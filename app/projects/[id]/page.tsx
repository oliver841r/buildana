import { notFound } from 'next/navigation';
import { exportPdf, getProject, saveProjectVersion, updateProject, updateProjectNotes } from '@/app/actions/projectActions';
import { ProjectWorkspace } from '@/components/forms/ProjectWorkspace';
import { requireAuth } from '@/lib/auth/options';

type ProjectPageProps = {
  params: Promise<{ id?: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  await requireAuth();
  const { id } = await params;
  if (!id) notFound();

  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Estimator Workspace</p>
      <h1 className="text-3xl font-semibold">Edit Project</h1>
      <ProjectWorkspace
        initial={{
          projectName: project.name,
          clientName: project.clientName,
          address: project.address,
          buildType: project.buildType,
          totalSqm: project.totalSqm,
          specLevel: project.specLevel,
          siteComplexity: project.siteComplexity,
          status: project.status,
          floors: project.floors,
          addOns: project.addOns as any,
          prelimPercent: project.prelimPercent,
          marginPercent: project.marginPercent,
          contingencyPercent: project.contingencyPercent,
          notes: project.notes
        }}
        versions={project.versions as any}
        onSave={async (data) => {
          'use server';
          await updateProject(project.id, data);
        }}
        onExport={async (mode) => {
          'use server';
          return exportPdf(project.id, mode);
        }}
        onSaveVersion={async (label) => {
          'use server';
          await saveProjectVersion(project.id, label);
        }}
        onSaveNotes={async (notes) => {
          'use server';
          await updateProjectNotes(project.id, notes);
        }}
      />
    </div>
  );
}
