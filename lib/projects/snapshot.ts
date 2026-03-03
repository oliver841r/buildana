import { Project, Prisma } from '@prisma/client';

export function buildProjectSnapshot(project: Pick<Project, 'name' | 'clientName' | 'address' | 'buildType' | 'totalSqm' | 'specLevel' | 'siteComplexity' | 'floors' | 'status' | 'prelimPercent' | 'marginPercent' | 'contingencyPercent' | 'addOns' | 'notes' | 'totals'>): Prisma.JsonObject {
  return {
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
  };
}
