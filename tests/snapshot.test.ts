import { describe, expect, it } from 'vitest';
import { Project } from '@prisma/client';
import { buildProjectSnapshot } from '../lib/projects/snapshot';

describe('buildProjectSnapshot', () => {
  it('captures input and output payload integrity', () => {
    const project = {
      name: 'Alpha',
      clientName: 'Client',
      address: '123 Test St',
      buildType: 'DUPLEX',
      totalSqm: 220,
      specLevel: 'MID',
      siteComplexity: 'MODERATE',
      floors: 2,
      status: 'QUOTED',
      prelimPercent: 0.1,
      marginPercent: 0.2,
      contingencyPercent: 0.05,
      addOns: [{ name: 'POOL', flatCost: 5000 }],
      notes: 'Internal note',
      totals: { total: 100000 }
    } satisfies Pick<Project, 'name' | 'clientName' | 'address' | 'buildType' | 'totalSqm' | 'specLevel' | 'siteComplexity' | 'floors' | 'status' | 'prelimPercent' | 'marginPercent' | 'contingencyPercent' | 'addOns' | 'notes' | 'totals'>;

    const snapshot = buildProjectSnapshot(project);

    expect((snapshot.inputs as { projectName: string }).projectName).toBe('Alpha');
    expect((snapshot.outputs as { total: number }).total).toBe(100000);
  });
});
