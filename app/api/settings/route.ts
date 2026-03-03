import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/options';

const defaultSettings = {
  specCostPerSqm: { STANDARD: 1850, MID: 2400, PREMIUM: 3200, ULTRA: 4200 },
  siteMultiplier: { FLAT: 1, MODERATE: 1.08, COMPLEX: 1.18 },
  featureCosts: { floorsMultiplier: { '1': 1, '2': 1.06, '3': 1.12 } },
  addOnDefaults: [
    { name: 'POOL', type: 'flat', value: 65000 },
    { name: 'HIGH_CEILINGS', type: 'multiplier', value: 1.05 },
    { name: 'UPGRADED_WINDOWS', type: 'flat', value: 18000 },
    { name: 'SMART_HOME', type: 'flat', value: 22000 },
    { name: 'LANDSCAPING_PREMIUM', type: 'flat', value: 30000 }
  ]
};

export async function GET() {
  await requireAuth(['ADMIN']);
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  if (!settings) return NextResponse.json({ error: 'Missing settings' }, { status: 404 });

  return NextResponse.json({
    specCostPerSqm: { ...defaultSettings.specCostPerSqm, ...(settings.specCostPerSqm as any) },
    siteMultiplier: { ...defaultSettings.siteMultiplier, ...(settings.siteMultiplier as any) },
    featureCosts: { ...defaultSettings.featureCosts, ...(settings.featureCosts as any) },
    addOnDefaults: ((settings.addOnDefaults as any[])?.length ? settings.addOnDefaults : defaultSettings.addOnDefaults) as any,
    categoryPercents: (settings.categoryPercents as any).raw
  });
}
