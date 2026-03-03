import { notFound } from 'next/navigation';
import { exportPdf, getProject, updateProject } from '@/app/actions/projectActions';
import { ProjectForm } from '@/components/forms/ProjectForm';
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
          storeys: (project.totals as any)?.roomConfiguration?.storeys ?? 1,
          regionType: (project.totals as any)?.advancedConfiguration?.regionType ?? 'METRO',
          facadeType: (project.totals as any)?.advancedConfiguration?.facadeType ?? 'STANDARD',
          sustainabilityLevel: (project.totals as any)?.advancedConfiguration?.sustainabilityLevel ?? 'NONE',
          energyPackage: (project.totals as any)?.advancedConfiguration?.energyPackage ?? 'STANDARD',
          timelineMonths: (project.totals as any)?.advancedConfiguration?.timelineMonths ?? 12,
          contingencyPercent: (project.totals as any)?.advancedConfiguration?.contingencyPercent ?? 0.05,
          escalationPercent: (project.totals as any)?.advancedConfiguration?.escalationPercent ?? 0,
          qualityAssurancePercent: (project.totals as any)?.advancedConfiguration?.qualityAssurancePercent ?? 0.02,
          discountPercent: (project.totals as any)?.advancedConfiguration?.discountPercent ?? 0,
          includeGst: (project.totals as any)?.advancedConfiguration?.includeGst ?? false,
          gstPercent: (project.totals as any)?.advancedConfiguration?.gstPercent ?? 0.1,
          permitCost: (project.totals as any)?.advancedConfiguration?.permitCost ?? 15000,
          demolitionCost: (project.totals as any)?.advancedConfiguration?.demolitionCost ?? 0
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
