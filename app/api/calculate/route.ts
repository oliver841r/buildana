import { NextResponse } from 'next/server';
import { calculateEstimate } from '@/lib/engine/calculate';
import { projectSchema, settingsSchema } from '@/lib/validation/schemas';
import { prisma } from '@/lib/db/prisma';

function toEngineInput(parsed: ReturnType<typeof projectSchema.parse>) {
  return {
    ...parsed,
    clientName: parsed.clientName ?? undefined,
    address: parsed.address ?? undefined
  };
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = projectSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  if (!settings) return NextResponse.json({ error: 'Settings not configured' }, { status: 500 });

  const rawCategoryPercents =
    typeof settings.categoryPercents === 'object' && settings.categoryPercents !== null && 'raw' in settings.categoryPercents
      ? (settings.categoryPercents as { raw: unknown }).raw
      : settings.categoryPercents;

  const specCostPerSqmParsed = settingsSchema.shape.specCostPerSqm.safeParse(settings.specCostPerSqm);
  const siteMultiplierParsed = settingsSchema.shape.siteMultiplier.safeParse(settings.siteMultiplier);
  const featureCostsParsed = settingsSchema.shape.featureCosts.safeParse(settings.featureCosts);
  const categoryPercentsParsed = settingsSchema.shape.categoryPercents.safeParse(rawCategoryPercents);

  if (!specCostPerSqmParsed.success || !siteMultiplierParsed.success || !featureCostsParsed.success || !categoryPercentsParsed.success) {
    return NextResponse.json({ error: 'Settings payload is invalid. Please review admin settings.' }, { status: 500 });
  }

  const estimate = calculateEstimate(toEngineInput(parsed.data), {
    specCostPerSqm: specCostPerSqmParsed.data,
    siteMultiplier: siteMultiplierParsed.data,
    categoryPercents: categoryPercentsParsed.data,
    featureCosts: featureCostsParsed.data
  });

  return NextResponse.json(estimate);
}
