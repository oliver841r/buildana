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
  return prisma.project.findUnique({ where: { id }, include: { breakdowns: true } });
}

export async function createProject(data: unknown) {
  await requireAuth(['ADMIN', 'ESTIMATOR']);
  const parsed = projectSchema.parse(data);
  const settings = await loadSettings();
  const estimate = calculateEstimate(parsed, {
    specCostPerSqm: settings.specCostPerSqm as any,
    siteMultiplier: settings.siteMultiplier as any,
    categoryPercents: (settings.categoryPercents as any).raw,
    featureCosts: settings.featureCosts as any
  });

  const project = await prisma.project.create({
    data: {
      name: parsed.projectName,
      buildType: parsed.buildType,
      totalSqm: parsed.totalSqm,
      specLevel: parsed.specLevel,
      siteComplexity: parsed.siteComplexity,
      prelimPercent: parsed.prelimPercent,
      marginPercent: parsed.marginPercent,
      addOns: parsed.addOns,
      totals: estimate,
      breakdowns: {
        create: estimate.categoryBreakdown
      }
    }
  });

  revalidatePath('/dashboard');
  return project;
}

export async function updateProject(id: string, data: unknown) {
  await requireAuth(['ADMIN', 'ESTIMATOR']);
  const parsed = projectSchema.parse(data);
  const settings = await loadSettings();
  const estimate = calculateEstimate(parsed, {
    specCostPerSqm: settings.specCostPerSqm as any,
    siteMultiplier: settings.siteMultiplier as any,
    categoryPercents: (settings.categoryPercents as any).raw,
    featureCosts: settings.featureCosts as any
  });

  await prisma.$transaction([
    prisma.projectCategoryBreakdown.deleteMany({ where: { projectId: id } }),
    prisma.project.update({
      where: { id },
      data: {
        name: parsed.projectName,
        buildType: parsed.buildType,
        totalSqm: parsed.totalSqm,
        specLevel: parsed.specLevel,
        siteComplexity: parsed.siteComplexity,
        prelimPercent: parsed.prelimPercent,
        marginPercent: parsed.marginPercent,
        addOns: parsed.addOns,
        totals: estimate,
        breakdowns: {
          create: estimate.categoryBreakdown
        }
      }
    })
  ]);

  revalidatePath(`/projects/${id}`);
}

export async function exportPdf(id: string) {
  await requireAuth();
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new Error('Project not found');
  const estimate = project.totals as any;
  const buffer = await renderToBuffer(<EstimatePdf projectName={project.name} estimate={estimate} />);
  return buffer.toString('base64');
}

export async function updateSettings(data: unknown) {
  await requireAuth(['ADMIN']);
  const parsed = settingsSchema.parse(data);
  const existing = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  await prisma.settings.update({
    where: { id: 'singleton' },
    data: {
      specCostPerSqm: parsed.specCostPerSqm,
      siteMultiplier: parsed.siteMultiplier,
      featureCosts: parsed.featureCosts,
      categoryPercents: { raw: parsed.categoryPercents, normalized: parsed.categoryPercents },
      addOnDefaults: existing?.addOnDefaults ?? {}
    }
  });
  revalidatePath('/settings');
}
