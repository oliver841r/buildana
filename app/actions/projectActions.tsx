'use server';

import { revalidatePath } from 'next/cache';
import { renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/options';
import { calculateEstimate } from '@/lib/engine/calculate';
import { projectSchema, settingsSchema } from '@/lib/validation/schemas';
import { EstimatePdf } from '@/components/pdf/EstimatePdf';

async function loadSettings() {
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  if (!settings) throw new Error('Settings not found');
  return settings;
}

export async function listProjects() {
  await requireAuth();
  return prisma.project.findMany({ orderBy: { updatedAt: 'desc' } });
}

export async function getProject(id: string) {
  await requireAuth();
  if (!id) return null;
  return prisma.project.findUnique({ where: { id }, include: { breakdowns: true, versions: { orderBy: { versionNumber: 'desc' } } } });
}

function mapSettings(settings: any) {
  return {
    specCostPerSqm: settings.specCostPerSqm as any,
    siteMultiplier: settings.siteMultiplier as any,
    categoryPercents: (settings.categoryPercents as any).raw,
    featureCosts: settings.featureCosts as any
  };
}

export async function createProject(data: unknown) {
  await requireAuth(['ADMIN', 'ESTIMATOR']);
  const parsed = projectSchema.parse(data);
  const settings = await loadSettings();
  const estimate = calculateEstimate(parsed as any, mapSettings(settings));

  const project = await prisma.project.create({
    data: {
      name: parsed.projectName,
      clientName: parsed.clientName,
      address: parsed.address,
      buildType: parsed.buildType,
      totalSqm: parsed.totalSqm,
      specLevel: parsed.specLevel,
      siteComplexity: parsed.siteComplexity,
      floors: parsed.floors,
      status: parsed.status,
      prelimPercent: parsed.prelimPercent,
      marginPercent: parsed.marginPercent,
      contingencyPercent: parsed.contingencyPercent,
      addOns: parsed.addOns,
      notes: parsed.notes,
      totals: estimate,
      breakdowns: { create: estimate.categoryBreakdown }
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/projects');
  return project;
}

export async function updateProject(id: string, data: unknown) {
  await requireAuth(['ADMIN', 'ESTIMATOR']);
  if (!id) throw new Error('Project ID is required');
  const parsed = projectSchema.parse(data);
  const settings = await loadSettings();
  const estimate = calculateEstimate(parsed as any, mapSettings(settings));

  await prisma.$transaction([
    prisma.projectCategoryBreakdown.deleteMany({ where: { projectId: id } }),
    prisma.project.update({
      where: { id },
      data: {
        name: parsed.projectName,
        clientName: parsed.clientName,
        address: parsed.address,
        buildType: parsed.buildType,
        totalSqm: parsed.totalSqm,
        specLevel: parsed.specLevel,
        siteComplexity: parsed.siteComplexity,
        floors: parsed.floors,
        status: parsed.status,
        prelimPercent: parsed.prelimPercent,
        marginPercent: parsed.marginPercent,
        contingencyPercent: parsed.contingencyPercent,
        addOns: parsed.addOns,
        notes: parsed.notes,
        totals: estimate,
        breakdowns: { create: estimate.categoryBreakdown }
      }
    })
  ]);

  revalidatePath(`/projects/${id}`);
  revalidatePath('/projects');
}

export async function saveProjectVersion(projectId: string, label?: string) {
  await requireAuth(['ADMIN', 'ESTIMATOR']);
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { versions: true } });
  if (!project) throw new Error('Project not found');
  const versionNumber = (project.versions[0]?.versionNumber ?? 0) + 1;

  await prisma.projectVersion.create({
    data: {
      projectId,
      versionNumber,
      label,
      snapshot: {
        inputs: {
          projectName: project.name,
          clientName: project.clientName,
          address: project.address,
          buildType: project.buildType,
          totalSqm: project.totalSqm,
          specLevel: project.specLevel,
          siteComplexity: project.siteComplexity,
          floors: project.floors,
          status: project.status,
          prelimPercent: project.prelimPercent,
          marginPercent: project.marginPercent,
          contingencyPercent: project.contingencyPercent,
          addOns: project.addOns,
          notes: project.notes
        },
        outputs: project.totals
      }
    }
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function updateProjectNotes(projectId: string, notes: string) {
  await requireAuth(['ADMIN', 'ESTIMATOR']);
  await prisma.project.update({ where: { id: projectId }, data: { notes } });
  revalidatePath(`/projects/${projectId}`);
}

export async function exportPdf(id: string, mode: 'CLIENT' | 'INTERNAL' = 'CLIENT') {
  await requireAuth();
  if (!id) throw new Error('Project ID is required');
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new Error('Project not found');
  const estimate = project.totals as any;
  const buffer = await renderToBuffer(
    <EstimatePdf
      projectName={project.name}
      clientName={project.clientName ?? undefined}
      address={project.address ?? undefined}
      notes={project.notes ?? undefined}
      estimate={estimate}
      mode={mode}
    />
  );
  return buffer.toString('base64');
}

export async function updateSettings(data: unknown) {
  await requireAuth(['ADMIN']);
  const parsed = settingsSchema.parse(data);
  await prisma.settings.update({
    where: { id: 'singleton' },
    data: {
      specCostPerSqm: parsed.specCostPerSqm,
      siteMultiplier: parsed.siteMultiplier,
      featureCosts: parsed.featureCosts,
      addOnDefaults: parsed.addOnDefaults,
      categoryPercents: { raw: parsed.categoryPercents, normalized: parsed.categoryPercents }
    }
  });
  revalidatePath('/settings');
}
