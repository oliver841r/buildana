import { describe, expect, it } from 'vitest';
import { calculateEstimate } from '../lib/engine/calculate';

const settings = {
  specCostPerSqm: { STANDARD: 1000, MID: 2000, PREMIUM: 3000 },
  siteMultiplier: { FLAT: 1, MODERATE: 1.1, COMPLEX: 1.2 },
  featureCosts: { bedroomCost: 1000, bathroomCost: 2000, garageSpaceCost: 500, doubleStoreyMultiplier: 1.1 },
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
  it('warns when margin below threshold', () => {
    const res = calculateEstimate(
      {
        projectName: 'A',
        buildType: 'DUPLEX',
        totalSqm: 100,
        specLevel: 'STANDARD',
        siteComplexity: 'FLAT',
        addOns: [],
        prelimPercent: 0.1,
        marginPercent: 0.1
      },
      settings as any
    );
    expect(res.warnings).toContain('Margin below 20%');
  });

  it('normalizes percentages when needed', () => {
    const res = calculateEstimate(
      {
        projectName: 'A',
        buildType: 'DUPLEX',
        totalSqm: 100,
        specLevel: 'STANDARD',
        siteComplexity: 'FLAT',
        addOns: [],
        prelimPercent: 0.1,
        marginPercent: 0.2
      },
      {
        ...settings,
        categoryPercents: { ...settings.categoryPercents, 'Site Costs': 0.2 }
      } as any
    );
    expect(res.warnings.some((x) => x.includes('normalized'))).toBe(true);
  });

  it('applies add-on multiplier before flat cost', () => {
    const res = calculateEstimate(
      {
        projectName: 'A',
        buildType: 'DUPLEX',
        totalSqm: 100,
        specLevel: 'STANDARD',
        siteComplexity: 'FLAT',
        addOns: [{ name: 'HIGH_CEILINGS', multiplier: 1.1 }, { name: 'POOL', flatCost: 5000 }],
        prelimPercent: 0,
        marginPercent: 0,
        bedroomCount: 0,
        bathroomCount: 0,
        garageSpaces: 0,
        storeys: 1
      },
      settings as any
    );
    expect(res.addOnsAdjusted).toBe(115000);
  });

  it('applies room adjustments and storey multiplier', () => {
    const res = calculateEstimate(
      {
        projectName: 'A',
        buildType: 'CUSTOM_HOME',
        totalSqm: 100,
        specLevel: 'STANDARD',
        siteComplexity: 'FLAT',
        addOns: [],
        prelimPercent: 0,
        marginPercent: 0,
        bedroomCount: 3,
        bathroomCount: 2,
        garageSpaces: 1,
        storeys: 2
      },
      settings as any
    );

    expect(res.roomConfiguration.roomAdjustment).toBe(8500);
    expect(res.addOnsAdjusted).toBe(118500);
  });

  it('computes totals accurately', () => {
    const res = calculateEstimate(
      {
        projectName: 'A',
        buildType: 'DUPLEX',
        totalSqm: 100,
        specLevel: 'STANDARD',
        siteComplexity: 'FLAT',
        addOns: [],
        prelimPercent: 0.1,
        marginPercent: 0.2,
        bedroomCount: 0,
        bathroomCount: 0,
        garageSpaces: 0,
        storeys: 1
      },
      settings as any
    );

    expect(res.baseCost).toBe(100000);
    expect(res.prelimCost).toBe(10000);
    expect(res.subtotal).toBe(110000);
    expect(res.margin).toBe(22000);
    expect(res.total).toBe(132000);
  });
});
