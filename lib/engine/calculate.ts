import { CATEGORY_NAMES, CategoryName, CategoryPercents, normalizeCategoryPercents } from './normalize';

export type BuildType = 'DUPLEX' | 'CUSTOM_HOME';
export type SpecLevel = 'STANDARD' | 'MID' | 'PREMIUM';
export type SiteComplexity = 'FLAT' | 'MODERATE' | 'COMPLEX';
export type AddOnName =
  | 'POOL'
  | 'HIGH_CEILINGS'
  | 'UPGRADED_WINDOWS'
  | 'SMART_HOME'
  | 'LANDSCAPING_PREMIUM';

export type AddOnInput = {
  name: AddOnName;
  flatCost?: number;
  multiplier?: number;
};

export type EstimateInput = {
  projectName: string;
  buildType: BuildType;
  totalSqm: number;
  specLevel: SpecLevel;
  siteComplexity: SiteComplexity;
  addOns: AddOnInput[];
  prelimPercent: number;
  marginPercent: number;
};

export type EngineSettings = {
  specCostPerSqm: Record<SpecLevel, number>;
  siteMultiplier: Record<SiteComplexity, number>;
  categoryPercents: CategoryPercents;
};

export type EstimateOutput = {
  baseCost: number;
  siteAdjusted: number;
  addOnsAdjusted: number;
  prelimCost: number;
  subtotal: number;
  margin: number;
  total: number;
  categoryBreakdown: {
    categoryName: CategoryName;
    percentRaw: number;
    percentNormalized: number;
    amount: number;
  }[];
  warnings: string[];
  normalizedCategoryPercents: CategoryPercents;
};

export function calculateEstimate(input: EstimateInput, settings: EngineSettings): EstimateOutput {
  const warnings: string[] = [];
  const normalized = normalizeCategoryPercents(settings.categoryPercents);
  warnings.push(...normalized.warnings);

  if (input.marginPercent < 0.2) {
    warnings.push('Margin below 20%');
  }

  const baseCost = input.totalSqm * settings.specCostPerSqm[input.specLevel];
  const siteAdjusted = baseCost * settings.siteMultiplier[input.siteComplexity];

  const multiplierFactor = input.addOns
    .filter((addOn) => addOn.multiplier)
    .reduce((acc, addOn) => acc * (addOn.multiplier ?? 1), 1);

  const flatCosts = input.addOns.reduce((acc, addOn) => acc + (addOn.flatCost ?? 0), 0);
  const addOnsAdjusted = siteAdjusted * multiplierFactor + flatCosts;

  const categoryBreakdown = CATEGORY_NAMES.map((categoryName) => {
    const percentRaw = settings.categoryPercents[categoryName];
    const percentNormalized = normalized.normalized[categoryName];

    return {
      categoryName,
      percentRaw,
      percentNormalized,
      amount: addOnsAdjusted * percentNormalized
    };
  });

  const prelimCost = addOnsAdjusted * input.prelimPercent;
  const subtotal = addOnsAdjusted + prelimCost;
  const margin = subtotal * input.marginPercent;
  const total = subtotal + margin;

  return {
    baseCost,
    siteAdjusted,
    addOnsAdjusted,
    prelimCost,
    subtotal,
    margin,
    total,
    categoryBreakdown,
    warnings,
    normalizedCategoryPercents: normalized.normalized
  };
}
