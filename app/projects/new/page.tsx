import { createProject } from '@/app/actions/projectActions';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { requireAuth } from '@/lib/auth/options';

export default async function NewProjectPage() {
  await requireAuth(['ADMIN', 'ESTIMATOR']);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-zinc-500">Estimator Workspace</p>
      <h1 className="mb-4 text-3xl font-semibold">Create Project</h1>
      <ProjectForm
        initial={{
          projectName: '',
          buildType: 'CUSTOM_HOME',
          totalSqm: 250,
          specLevel: 'MID',
          siteComplexity: 'FLAT',
          addOns: [],
          prelimPercent: 0.1,
          marginPercent: 0.2,
          bedroomCount: 4,
          bathroomCount: 2,
          garageSpaces: 2,
          storeys: 1
        }}
        onSave={async (data) => {
          'use server';
          await createProject(data);
        }}
      />
    </div>
  );
}
