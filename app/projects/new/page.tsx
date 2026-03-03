import { createProject } from '@/app/actions/projectActions';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { requireAuth } from '@/lib/auth/options';

export default async function NewProjectPage() {
  await requireAuth(['ADMIN', 'ESTIMATOR']);

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Estimator Workspace</p>
      <h1 className="text-3xl font-semibold">Create Project</h1>
      <ProjectForm
        initial={{
          projectName: '',
          clientName: '',
          address: '',
          buildType: 'CUSTOM_HOME',
          totalSqm: 250,
          specLevel: 'MID',
          siteComplexity: 'FLAT',
          status: 'DRAFT',
          floors: 2,
          addOns: [],
          prelimPercent: 0.1,
          marginPercent: 0.2,
          contingencyPercent: 0.05,
          notes: ''
        }}
        onSave={async (data) => {
          'use server';
          await createProject(data);
        }}
      />
    </div>
  );
}
