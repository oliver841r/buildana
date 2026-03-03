import { CATEGORY_NAMES, CategoryName, CategoryPercents, normalizeCategoryPercents } from './normalize';

export type BuildType = 'DUPLEX' | 'CUSTOM_HOME';
export type SpecLevel = 'STANDARD' | 'MID' | 'PREMIUM' | 'ULTRA';
export type SiteComplexity = 'FLAT' | 'MODERATE' | 'COMPLEX';
export type ProjectStatus = 'DRAFT' | 'FEASIBILITY' | 'QUOTED' | 'SIGNED' | 'ARCHIVED';
export type AddOnName = 'POOL' | 'HIGH_CEILINGS' | 'UPGRADED_WINDOWS' | 'SMART_HOME' | 'LANDSCAPING_PREMIUM';

export type AddOnInput = {
  name: AddOnName;
  flatCost?: number;
  multiplier?: number;
};

export type EstimateInput = {
  projectName: string;
  clientName?: string;
  address?: string;
  buildType: BuildType;
  totalSqm: number;
  specLevel: SpecLevel;
  siteComplexity: SiteComplexity;
  status?: ProjectStatus;
  floors?: number;
  addOns: AddOnInput[];
  prelimPercent: number;
  marginPercent: number;
  contingencyPercent?: number;
};

export type FeatureCosts = {
  floorsMultiplier: Record<'1' | '2' | '3', number>;
};

export type EngineSettings = {
  specCostPerSqm: Record<SpecLevel, number>;
  siteMultiplier: Record<SiteComplexity, number>;
  categoryPercents: CategoryPercents;
  featureCosts?: FeatureCosts;
};

export type EstimateOutput = {
  baseCost: number;
  siteAdjusted: number;
  addOnsAdjusted: number;
  prelimCost: number;
  contingencyCost: number;
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

  if (input.marginPercent < 0.2) warnings.push('Margin below 20%');
  if (input.prelimPercent < 0.08) warnings.push('Preliminaries below 8%');

  const contingencyPercent = input.contingencyPercent ?? 0.05;
  if (contingencyPercent < 0.03) warnings.push('Contingency below 3%');

  const floors = Math.max(1, Math.min(3, input.floors ?? 2));
  const floorsMultiplier = settings.featureCosts?.floorsMultiplier ?? { '1': 1, '2': 1.06, '3': 1.12 };

  const baseCost = input.totalSqm * settings.specCostPerSqm[input.specLevel];
  const siteAdjusted = baseCost * settings.siteMultiplier[input.siteComplexity] * (floorsMultiplier[String(floors) as '1' | '2' | '3'] ?? 1);

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

  const windowsCategory = categoryBreakdown.find((x) => x.categoryName === 'Windows & Doors');
  if ((windowsCategory?.percentNormalized ?? 0) > 0.2) warnings.push('Windows & Doors allocation exceeds 20%');

  const prelimCost = addOnsAdjusted * input.prelimPercent;
  const contingencyCost = (addOnsAdjusted + prelimCost) * contingencyPercent;
  const subtotal = addOnsAdjusted + prelimCost + contingencyCost;
  const margin = subtotal * input.marginPercent;
  const total = subtotal + margin;

  return {
    baseCost,
    siteAdjusted,
    addOnsAdjusted,
    prelimCost,
    contingencyCost,
    subtotal,
    margin,
    total,
    categoryBreakdown: categoryBreakdown ?? [],
    warnings,
    normalizedCategoryPercents: normalized.normalized
  };
}
