import { describe, expect, it } from 'vitest';
import { calculateEstimate } from '../lib/engine/calculate';

const settings = {
  specCostPerSqm: { STANDARD: 1000, MID: 2000, PREMIUM: 3000, ULTRA: 4000 },
  siteMultiplier: { FLAT: 1, MODERATE: 1.1, COMPLEX: 1.2 },
  featureCosts: { floorsMultiplier: { '1': 1, '2': 1.06, '3': 1.12 } },
  categoryPercents: {
    'Slab & Structure': 0.1,
    Framing: 0.1,
    Roofing: 0.1,
    'Windows & Doors': 0.1,
    Electrical: 0.1,
    Plumbing: 0.1,
    HVAC: 0.1,
    Joinery: 0.1,
    Tiling: 0.1,
    Flooring: 0.05,
    Painting: 0.05,
    Landscaping: 0.05,
    'Site Costs': 0.05
  }
} as const;

describe('calculateEstimate', () => {
  it('applies floors multiplier', () => {
    const res = calculateEstimate({
      projectName: 'A', buildType: 'DUPLEX', totalSqm: 100, specLevel: 'STANDARD', siteComplexity: 'FLAT', floors: 3,
      addOns: [], prelimPercent: 0.1, marginPercent: 0.2, contingencyPercent: 0.05
    }, settings as any);
    expect(res.siteAdjusted).toBe(112000);
  });

  it('applies add-on multiplier before flat cost', () => {
    const res = calculateEstimate({
      projectName: 'A', buildType: 'DUPLEX', totalSqm: 100, specLevel: 'STANDARD', siteComplexity: 'FLAT', floors: 1,
      addOns: [{ name: 'HIGH_CEILINGS', multiplier: 1.1 }, { name: 'POOL', flatCost: 5000 }], prelimPercent: 0, marginPercent: 0, contingencyPercent: 0
    }, settings as any);
    expect(res.addOnsAdjusted).toBe(115000);
  });

  it('computes contingency math', () => {
    const res = calculateEstimate({
      projectName: 'A', buildType: 'DUPLEX', totalSqm: 100, specLevel: 'STANDARD', siteComplexity: 'FLAT', floors: 1,
      addOns: [], prelimPercent: 0.1, marginPercent: 0.2, contingencyPercent: 0.05
    }, settings as any);
    expect(res.contingencyCost).toBe(5500);
  });

  it('generates warnings', () => {
    const res = calculateEstimate({
      projectName: 'A', buildType: 'DUPLEX', totalSqm: 100, specLevel: 'STANDARD', siteComplexity: 'FLAT', floors: 1,
      addOns: [], prelimPercent: 0.05, marginPercent: 0.1, contingencyPercent: 0.02
    }, settings as any);
    expect(res.warnings).toContain('Margin below 20%');
    expect(res.warnings).toContain('Preliminaries below 8%');
    expect(res.warnings).toContain('Contingency below 3%');
  });

  it('normalizes percentages when needed', () => {
    const res = calculateEstimate({
      projectName: 'A', buildType: 'DUPLEX', totalSqm: 100, specLevel: 'STANDARD', siteComplexity: 'FLAT', floors: 1,
      addOns: [], prelimPercent: 0.1, marginPercent: 0.2, contingencyPercent: 0.05
    }, { ...settings, categoryPercents: { ...settings.categoryPercents, 'Site Costs': 0.2 } } as any);

    expect(res.warnings.some((x) => x.includes('normalized'))).toBe(true);
    expect(Array.isArray(res.categoryBreakdown)).toBe(true);
  });
});
