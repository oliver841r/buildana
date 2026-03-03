import { CATEGORY_NAMES, CategoryName, CategoryPercents, normalizeCategoryPercents } from './normalize';

export type BuildType = 'DUPLEX' | 'CUSTOM_HOME';
export type SpecLevel = 'STANDARD' | 'MID' | 'PREMIUM';
export type SiteComplexity = 'FLAT' | 'MODERATE' | 'COMPLEX';
export type RegionType = 'METRO' | 'REGIONAL' | 'REMOTE';
export type FacadeType = 'STANDARD' | 'ARCHITECTURAL' | 'LUXURY';
export type SustainabilityLevel = 'NONE' | 'SILVER' | 'GOLD';
export type EnergyPackage = 'STANDARD' | 'BASIX_PLUS' | 'NET_ZERO_READY';
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
  bedroomCount?: number;
  bathroomCount?: number;
  garageSpaces?: number;
  storeys?: number;
  regionType?: RegionType;
  facadeType?: FacadeType;
  sustainabilityLevel?: SustainabilityLevel;
  energyPackage?: EnergyPackage;
  timelineMonths?: number;
  contingencyPercent?: number;
  escalationPercent?: number;
  qualityAssurancePercent?: number;
  discountPercent?: number;
  includeGst?: boolean;
  gstPercent?: number;
  permitCost?: number;
  demolitionCost?: number;
};

export type FeatureCosts = {
  bedroomCost: number;
  bathroomCost: number;
  garageSpaceCost: number;
  doubleStoreyMultiplier: number;
  sustainabilityFlatCosts: Record<SustainabilityLevel, number>;
  energyPackageCosts: Record<EnergyPackage, number>;
  regionalMultiplier: Record<RegionType, number>;
  facadeMultiplier: Record<FacadeType, number>;
  qualityAssurancePercentDefault: number;
  permitCostDefault: number;
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
  subtotal: number;
  margin: number;
  gstCost: number;
  discountAmount: number;
  escalationCost: number;
  contingencyCost: number;
  qualityAssuranceCost: number;
  total: number;
  categoryBreakdown: {
    categoryName: CategoryName;
    percentRaw: number;
    percentNormalized: number;
    amount: number;
  }[];
  roomConfiguration: {
    bedroomCount: number;
    bathroomCount: number;
    garageSpaces: number;
    storeys: number;
    roomAdjustment: number;
  };
  advancedConfiguration: {
    regionType: RegionType;
    facadeType: FacadeType;
    sustainabilityLevel: SustainabilityLevel;
    energyPackage: EnergyPackage;
    timelineMonths: number;
    includeGst: boolean;
    contingencyPercent: number;
    escalationPercent: number;
    qualityAssurancePercent: number;
    discountPercent: number;
    gstPercent: number;
    permitCost: number;
    demolitionCost: number;
  };
  warnings: string[];
  normalizedCategoryPercents: CategoryPercents;
};

const defaultFeatureCosts: FeatureCosts = {
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

export function calculateEstimate(input: EstimateInput, settings: EngineSettings): EstimateOutput {
  const warnings: string[] = [];
  const normalized = normalizeCategoryPercents(settings.categoryPercents);
  warnings.push(...normalized.warnings);

  if (input.marginPercent < 0.2) {
    warnings.push('Margin below 20%');
  }

  const featureCosts: FeatureCosts = {
    ...defaultFeatureCosts,
    ...(settings.featureCosts ?? {}),
    sustainabilityFlatCosts: {
      ...defaultFeatureCosts.sustainabilityFlatCosts,
      ...(settings.featureCosts?.sustainabilityFlatCosts ?? {})
    },
    energyPackageCosts: {
      ...defaultFeatureCosts.energyPackageCosts,
      ...(settings.featureCosts?.energyPackageCosts ?? {})
    },
    regionalMultiplier: {
      ...defaultFeatureCosts.regionalMultiplier,
      ...(settings.featureCosts?.regionalMultiplier ?? {})
    },
    facadeMultiplier: {
      ...defaultFeatureCosts.facadeMultiplier,
      ...(settings.featureCosts?.facadeMultiplier ?? {})
    }
  };

  const roomConfiguration = {
    bedroomCount: input.bedroomCount ?? 4,
    bathroomCount: input.bathroomCount ?? 2,
    garageSpaces: input.garageSpaces ?? 2,
    storeys: input.storeys ?? 1
  };

  const advancedConfiguration = {
    regionType: input.regionType ?? 'METRO',
    facadeType: input.facadeType ?? 'STANDARD',
    sustainabilityLevel: input.sustainabilityLevel ?? 'NONE',
    energyPackage: input.energyPackage ?? 'STANDARD',
    timelineMonths: input.timelineMonths ?? 12,
    includeGst: input.includeGst ?? false,
    contingencyPercent: input.contingencyPercent ?? 0,
    escalationPercent: input.escalationPercent ?? 0,
    qualityAssurancePercent: input.qualityAssurancePercent ?? 0,
    discountPercent: input.discountPercent ?? 0,
    gstPercent: input.gstPercent ?? 0.1,
    permitCost: input.permitCost ?? 0,
    demolitionCost: input.demolitionCost ?? 0
  };

  if (advancedConfiguration.timelineMonths > 18) warnings.push('Long program: check escalation assumptions.');
  if (advancedConfiguration.discountPercent > 0.1) warnings.push('Discount exceeds 10%; validate deal viability.');

  const baseCost = input.totalSqm * settings.specCostPerSqm[input.specLevel];
  const siteAdjusted = baseCost * settings.siteMultiplier[input.siteComplexity];

  const multiplierFactor = input.addOns
    .filter((addOn) => addOn.multiplier)
    .reduce((acc, addOn) => acc * (addOn.multiplier ?? 1), 1);

  const flatCosts = input.addOns.reduce((acc, addOn) => acc + (addOn.flatCost ?? 0), 0);

  const roomAdjustment =
    roomConfiguration.bedroomCount * featureCosts.bedroomCost +
    roomConfiguration.bathroomCount * featureCosts.bathroomCost +
    roomConfiguration.garageSpaces * featureCosts.garageSpaceCost;

  const storeyMultiplier = roomConfiguration.storeys > 1 ? featureCosts.doubleStoreyMultiplier : 1;
  const regionMultiplier = featureCosts.regionalMultiplier[advancedConfiguration.regionType] ?? 1;
  const facadeMultiplier = featureCosts.facadeMultiplier[advancedConfiguration.facadeType] ?? 1;
  const sustainabilityCost = featureCosts.sustainabilityFlatCosts[advancedConfiguration.sustainabilityLevel] ?? 0;
  const energyPackageCost = featureCosts.energyPackageCosts[advancedConfiguration.energyPackage] ?? 0;

  const structuralAdjusted = siteAdjusted * regionMultiplier * facadeMultiplier * multiplierFactor * storeyMultiplier;
  const addOnsAdjusted =
    structuralAdjusted +
    flatCosts +
    roomAdjustment +
    sustainabilityCost +
    energyPackageCost +
    advancedConfiguration.permitCost +
    advancedConfiguration.demolitionCost;

  const escalationCost = addOnsAdjusted * advancedConfiguration.escalationPercent * (advancedConfiguration.timelineMonths / 12);
  const contingencyCost = (addOnsAdjusted + escalationCost) * advancedConfiguration.contingencyPercent;
  const qualityAssuranceCost = (addOnsAdjusted + escalationCost) * advancedConfiguration.qualityAssurancePercent;

  const categoryBase = addOnsAdjusted + escalationCost + contingencyCost + qualityAssuranceCost;

  const categoryBreakdown = CATEGORY_NAMES.map((categoryName) => {
    const percentRaw = settings.categoryPercents[categoryName];
    const percentNormalized = normalized.normalized[categoryName];

    return {
      categoryName,
      percentRaw,
      percentNormalized,
      amount: categoryBase * percentNormalized
    };
  });

  const prelimCost = categoryBase * input.prelimPercent;
  const commercialSubtotal = categoryBase + prelimCost;
  const discountAmount = commercialSubtotal * advancedConfiguration.discountPercent;
  const discountedSubtotal = commercialSubtotal - discountAmount;
  const margin = discountedSubtotal * input.marginPercent;
  const exGstTotal = discountedSubtotal + margin;
  const gstCost = advancedConfiguration.includeGst ? exGstTotal * advancedConfiguration.gstPercent : 0;
  const total = exGstTotal + gstCost;

  return {
    baseCost,
    siteAdjusted,
    addOnsAdjusted,
    prelimCost,
    subtotal: discountedSubtotal,
    margin,
    gstCost,
    discountAmount,
    escalationCost,
    contingencyCost,
    qualityAssuranceCost,
    total,
    categoryBreakdown,
    roomConfiguration: { ...roomConfiguration, roomAdjustment },
    advancedConfiguration,
    warnings,
    normalizedCategoryPercents: normalized.normalized
  };
}
