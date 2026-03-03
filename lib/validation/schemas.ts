import { z } from 'zod';

const addOnSchema = z
  .object({
    name: z.enum(['POOL', 'HIGH_CEILINGS', 'UPGRADED_WINDOWS', 'SMART_HOME', 'LANDSCAPING_PREMIUM']),
    flatCost: z.number().nonnegative().optional(),
    multiplier: z.number().positive().optional()
  })
  .refine((v) => v.flatCost !== undefined || v.multiplier !== undefined, 'Add-on requires a flat cost or multiplier');

export const projectSchema = z.object({
  id: z.string().optional(),
  projectName: z.string().min(2, 'Project name is required'),
  buildType: z.enum(['DUPLEX', 'CUSTOM_HOME']),
  totalSqm: z.number().positive('Total sqm must be greater than zero'),
  specLevel: z.enum(['STANDARD', 'MID', 'PREMIUM']),
  siteComplexity: z.enum(['FLAT', 'MODERATE', 'COMPLEX']),
  addOns: z.array(addOnSchema),
  prelimPercent: z.number().min(0).max(1),
  marginPercent: z.number().min(0).max(1),
  bedroomCount: z.number().int().min(1).max(12).default(4),
  bathroomCount: z.number().int().min(1).max(8).default(2),
  garageSpaces: z.number().int().min(0).max(6).default(2),
  storeys: z.number().int().min(1).max(3).default(1),
  regionType: z.enum(['METRO', 'REGIONAL', 'REMOTE']).default('METRO'),
  facadeType: z.enum(['STANDARD', 'ARCHITECTURAL', 'LUXURY']).default('STANDARD'),
  sustainabilityLevel: z.enum(['NONE', 'SILVER', 'GOLD']).default('NONE'),
  energyPackage: z.enum(['STANDARD', 'BASIX_PLUS', 'NET_ZERO_READY']).default('STANDARD'),
  timelineMonths: z.number().int().min(1).max(48).default(12),
  contingencyPercent: z.number().min(0).max(1).default(0.05),
  escalationPercent: z.number().min(0).max(1).default(0),
  qualityAssurancePercent: z.number().min(0).max(1).default(0.02),
  discountPercent: z.number().min(0).max(0.5).default(0),
  includeGst: z.boolean().default(false),
  gstPercent: z.number().min(0).max(1).default(0.1),
  permitCost: z.number().nonnegative().default(15000),
  demolitionCost: z.number().nonnegative().default(0)
});

export const settingsSchema = z.object({
  specCostPerSqm: z.object({
    STANDARD: z.number().positive(),
    MID: z.number().positive(),
    PREMIUM: z.number().positive()
  }),
  siteMultiplier: z.object({
    FLAT: z.number().positive(),
    MODERATE: z.number().positive(),
    COMPLEX: z.number().positive()
  }),
  featureCosts: z.object({
    bedroomCost: z.number().nonnegative(),
    bathroomCost: z.number().nonnegative(),
    garageSpaceCost: z.number().nonnegative(),
    doubleStoreyMultiplier: z.number().positive(),
    sustainabilityFlatCosts: z.object({
      NONE: z.number().nonnegative(),
      SILVER: z.number().nonnegative(),
      GOLD: z.number().nonnegative()
    }),
    energyPackageCosts: z.object({
      STANDARD: z.number().nonnegative(),
      BASIX_PLUS: z.number().nonnegative(),
      NET_ZERO_READY: z.number().nonnegative()
    }),
    regionalMultiplier: z.object({
      METRO: z.number().positive(),
      REGIONAL: z.number().positive(),
      REMOTE: z.number().positive()
    }),
    facadeMultiplier: z.object({
      STANDARD: z.number().positive(),
      ARCHITECTURAL: z.number().positive(),
      LUXURY: z.number().positive()
    }),
    qualityAssurancePercentDefault: z.number().min(0).max(1),
    permitCostDefault: z.number().nonnegative()
  }),
  categoryPercents: z.object({
    'Slab & Structure': z.number().nonnegative(),
    Framing: z.number().nonnegative(),
    Roofing: z.number().nonnegative(),
    'Windows & Doors': z.number().nonnegative(),
    Electrical: z.number().nonnegative(),
    Plumbing: z.number().nonnegative(),
    HVAC: z.number().nonnegative(),
    Joinery: z.number().nonnegative(),
    Tiling: z.number().nonnegative(),
    Flooring: z.number().nonnegative(),
    Painting: z.number().nonnegative(),
    Landscaping: z.number().nonnegative(),
    'Site Costs': z.number().nonnegative()
  })
});

export type ProjectInput = z.infer<typeof projectSchema>;
