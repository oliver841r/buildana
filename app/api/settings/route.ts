import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/options';

export async function GET() {
  await requireAuth(['ADMIN']);
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  if (!settings) return NextResponse.json({ error: 'Missing settings' }, { status: 404 });
  return NextResponse.json({
    specCostPerSqm: settings.specCostPerSqm,
    siteMultiplier: settings.siteMultiplier,
    featureCosts: settings.featureCosts ?? { bedroomCost: 18000, bathroomCost: 24000, garageSpaceCost: 12000, doubleStoreyMultiplier: 1.12 },
    categoryPercents: (settings.categoryPercents as any).raw
  });
}
