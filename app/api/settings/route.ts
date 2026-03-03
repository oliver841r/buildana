import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/options';

const defaultFeatureCosts = {
  bedroomCost: 18000,
  bathroomCost: 24000,
  garageSpaceCost: 12000,
  doubleStoreyMultiplier: 1.12,
  sustainabilityFlatCosts: { NONE: 0, SILVER: 18000, GOLD: 42000 },
  energyPackageCosts: { STANDARD: 0, BASIX_PLUS: 14000, NET_ZERO_READY: 36000 },
  regionalMultiplier: { METRO: 1, REGIONAL: 1.06, REMOTE: 1.14 },
  facadeMultiplier: { STANDARD: 1, ARCHITECTURAL: 1.08, LUXURY: 1.16 },
  qualityAssurancePercentDefault: 0.02,
  permitCostDefault: 15000
};

export async function GET() {
  await requireAuth(['ADMIN']);
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  if (!settings) return NextResponse.json({ error: 'Missing settings' }, { status: 404 });

  const featureCosts = {
    ...defaultFeatureCosts,
    ...(settings.featureCosts as any),
    sustainabilityFlatCosts: {
      ...defaultFeatureCosts.sustainabilityFlatCosts,
      ...((settings.featureCosts as any)?.sustainabilityFlatCosts ?? {})
    },
    energyPackageCosts: {
      ...defaultFeatureCosts.energyPackageCosts,
      ...((settings.featureCosts as any)?.energyPackageCosts ?? {})
    },
    regionalMultiplier: {
      ...defaultFeatureCosts.regionalMultiplier,
      ...((settings.featureCosts as any)?.regionalMultiplier ?? {})
    },
    facadeMultiplier: {
      ...defaultFeatureCosts.facadeMultiplier,
      ...((settings.featureCosts as any)?.facadeMultiplier ?? {})
    }
  };

  return NextResponse.json({
    specCostPerSqm: settings.specCostPerSqm,
    siteMultiplier: settings.siteMultiplier,
    featureCosts,
    categoryPercents: (settings.categoryPercents as any).raw
  });
}
