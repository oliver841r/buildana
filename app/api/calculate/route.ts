import { NextResponse } from 'next/server';
import { calculateEstimate } from '@/lib/engine/calculate';
import { projectSchema, SettingsInput } from '@/lib/validation/schemas';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = projectSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  if (!settings) return NextResponse.json({ error: 'Settings not configured' }, { status: 500 });

  const dbSettings = settings as {
    specCostPerSqm: SettingsInput['specCostPerSqm'];
    siteMultiplier: SettingsInput['siteMultiplier'];
    featureCosts: SettingsInput['featureCosts'];
    categoryPercents: { raw: SettingsInput['categoryPercents'] };
  };

  const estimate = calculateEstimate(parsed.data, {
    specCostPerSqm: dbSettings.specCostPerSqm,
    siteMultiplier: dbSettings.siteMultiplier,
    categoryPercents: dbSettings.categoryPercents.raw,
    featureCosts: dbSettings.featureCosts
  });

  return NextResponse.json(estimate);
}
