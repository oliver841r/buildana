import { createProject } from '@/app/actions/projectActions';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { requireAuth } from '@/lib/auth/options';

export default async function NewProjectPage() {
  await requireAuth(['ADMIN', 'ESTIMATOR']);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Create Project</h1>
      <ProjectForm
        initial={{
          projectName: '',
          buildType: 'CUSTOM_HOME',
          totalSqm: 250,
          specLevel: 'MID',
          siteComplexity: 'FLAT',
          addOns: [],
          prelimPercent: 0.1,
          marginPercent: 0.2
        }}
        onSave={async (data) => {
          'use server';
          await createProject(data);
        }}
      />
    </div>
  );
}
