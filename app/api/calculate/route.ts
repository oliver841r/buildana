import { NextResponse } from 'next/server';
import { calculateEstimate } from '@/lib/engine/calculate';
import { projectSchema } from '@/lib/validation/schemas';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = projectSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  if (!settings) return NextResponse.json({ error: 'Settings not configured' }, { status: 500 });

  const estimate = calculateEstimate(parsed.data, {
    specCostPerSqm: settings.specCostPerSqm as any,
    siteMultiplier: settings.siteMultiplier as any,
    categoryPercents: (settings.categoryPercents as any).raw,
    featureCosts: settings.featureCosts as any
  });

  return NextResponse.json(estimate);
}
