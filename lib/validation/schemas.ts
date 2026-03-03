import { z } from 'zod';

export const addOnNameSchema = z.enum(['POOL', 'HIGH_CEILINGS', 'UPGRADED_WINDOWS', 'SMART_HOME', 'LANDSCAPING_PREMIUM']);

export const addOnSchema = z
  .object({
    name: addOnNameSchema,
    flatCost: z.number().nonnegative().optional(),
    multiplier: z.number().positive().optional()
  })
  .refine((v) => v.flatCost !== undefined || v.multiplier !== undefined, 'Add-on requires a flat cost or multiplier');

export const projectSchema = z.object({
  id: z.string().optional(),
  projectName: z.string().min(2, 'Project name is required'),
  clientName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  buildType: z.enum(['DUPLEX', 'CUSTOM_HOME']),
  totalSqm: z.number().positive('Total sqm must be greater than zero'),
  specLevel: z.enum(['STANDARD', 'MID', 'PREMIUM', 'ULTRA']),
  siteComplexity: z.enum(['FLAT', 'MODERATE', 'COMPLEX']),
  status: z.enum(['DRAFT', 'FEASIBILITY', 'QUOTED', 'SIGNED', 'ARCHIVED']).default('DRAFT'),
  floors: z.number().int().min(1).max(3).default(2),
  addOns: z.array(addOnSchema),
  prelimPercent: z.number().min(0).max(1),
  marginPercent: z.number().min(0).max(1),
  contingencyPercent: z.number().min(0).max(1).default(0.05),
  notes: z.string().optional().nullable()
});

export const addOnDefaultSchema = z.object({
  name: addOnNameSchema,
  type: z.enum(['flat', 'multiplier']),
  value: z.number().positive()
});

export const settingsSchema = z.object({
  specCostPerSqm: z.object({
    STANDARD: z.number().positive(),
    MID: z.number().positive(),
    PREMIUM: z.number().positive(),
    ULTRA: z.number().positive()
  }),
  siteMultiplier: z.object({
    FLAT: z.number().positive(),
    MODERATE: z.number().positive(),
    COMPLEX: z.number().positive()
  }),
  featureCosts: z.object({
    floorsMultiplier: z.object({
      '1': z.number().positive(),
      '2': z.number().positive(),
      '3': z.number().positive()
    })
  }),
  addOnDefaults: z.array(addOnDefaultSchema),
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
export type SettingsInput = z.infer<typeof settingsSchema>;
export type AddOnDefaultInput = z.infer<typeof addOnDefaultSchema>;
