import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/options';
import { SettingsInput } from '@/lib/validation/schemas';

const defaultSettings: SettingsInput = {
  specCostPerSqm: { STANDARD: 1850, MID: 2400, PREMIUM: 3200, ULTRA: 4200 },
  siteMultiplier: { FLAT: 1, MODERATE: 1.08, COMPLEX: 1.18 },
  featureCosts: { floorsMultiplier: { '1': 1, '2': 1.06, '3': 1.12 } },
  addOnDefaults: [
    { name: 'POOL', type: 'flat', value: 65000 },
    { name: 'HIGH_CEILINGS', type: 'multiplier', value: 1.05 },
    { name: 'UPGRADED_WINDOWS', type: 'flat', value: 18000 },
    { name: 'SMART_HOME', type: 'flat', value: 22000 },
    { name: 'LANDSCAPING_PREMIUM', type: 'flat', value: 30000 }
  ],
  categoryPercents: {
    'Slab & Structure': 0.16,
    Framing: 0.1,
    Roofing: 0.07,
    'Windows & Doors': 0.08,
    Electrical: 0.07,
    Plumbing: 0.07,
    HVAC: 0.06,
    Joinery: 0.09,
    Tiling: 0.05,
    Flooring: 0.05,
    Painting: 0.05,
    Landscaping: 0.07,
    'Site Costs': 0.08
  }
};

export async function GET() {
  await requireAuth(['ADMIN']);
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  if (!settings) return NextResponse.json({ error: 'Missing settings' }, { status: 404 });

  const dbSettings = settings as {
    specCostPerSqm: SettingsInput['specCostPerSqm'];
    siteMultiplier: SettingsInput['siteMultiplier'];
    featureCosts: SettingsInput['featureCosts'];
    addOnDefaults: SettingsInput['addOnDefaults'];
    categoryPercents: { raw: SettingsInput['categoryPercents'] };
  };

  return NextResponse.json({
    specCostPerSqm: { ...defaultSettings.specCostPerSqm, ...dbSettings.specCostPerSqm },
    siteMultiplier: { ...defaultSettings.siteMultiplier, ...dbSettings.siteMultiplier },
    featureCosts: { ...defaultSettings.featureCosts, ...dbSettings.featureCosts },
    addOnDefaults: dbSettings.addOnDefaults?.length ? dbSettings.addOnDefaults : defaultSettings.addOnDefaults,
    categoryPercents: dbSettings.categoryPercents.raw
  });
}
