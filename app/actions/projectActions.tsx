'use server';

import { revalidatePath } from 'next/cache';
import { renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/options';
import { calculateEstimate, EstimateOutput } from '@/lib/engine/calculate';
import { CategoryPercents, normalizeCategoryPercents } from '@/lib/engine/normalize';
import { AddOnDefaultInput, projectSchema, settingsSchema } from '@/lib/validation/schemas';
import { EstimatePdf } from '@/components/pdf/EstimatePdf';
import { buildProjectSnapshot } from '@/lib/projects/snapshot';

async function loadSettings() {
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  if (!settings) throw new Error('Settings not found');
  return settings;
}

function mapSettings(settings: Awaited<ReturnType<typeof loadSettings>>) {
  return {
    specCostPerSqm: settings.specCostPerSqm as Record<'STANDARD' | 'MID' | 'PREMIUM' | 'ULTRA', number>,
    siteMultiplier: settings.siteMultiplier as Record<'FLAT' | 'MODERATE' | 'COMPLEX', number>,
    categoryPercents: (settings.categoryPercents as { raw: CategoryPercents }).raw,
    featureCosts: settings.featureCosts as { floorsMultiplier: Record<'1' | '2' | '3', number> }
  };
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

export async function createProject(data: unknown) {
  await requireAuth(['ADMIN', 'ESTIMATOR']);
  const parsed = projectSchema.parse(data);
  const settings = await loadSettings();
  const estimate = calculateEstimate(parsed, mapSettings(settings));

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
  const estimate = calculateEstimate(parsed, mapSettings(settings));

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
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { versions: { orderBy: { versionNumber: 'desc' } } } });
  if (!project) throw new Error('Project not found');
  const versionNumber = (project.versions[0]?.versionNumber ?? 0) + 1;

  await prisma.projectVersion.create({
    data: {
      projectId,
      versionNumber,
      label,
      snapshot: buildProjectSnapshot(project)
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
  const estimate = project.totals as EstimateOutput;
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
  const normalized = normalizeCategoryPercents(parsed.categoryPercents);

  const addOnDefaults: AddOnDefaultInput[] = parsed.addOnDefaults;

  await prisma.settings.update({
    where: { id: 'singleton' },
    data: {
      specCostPerSqm: parsed.specCostPerSqm,
      siteMultiplier: parsed.siteMultiplier,
      featureCosts: parsed.featureCosts,
      addOnDefaults,
      categoryPercents: { raw: parsed.categoryPercents, normalized: normalized.normalized }
    }
  });
  revalidatePath('/settings');
}
