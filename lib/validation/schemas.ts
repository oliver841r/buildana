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
  marginPercent: z.number().min(0).max(1)
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
