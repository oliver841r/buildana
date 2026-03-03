import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categoryRaw = {
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
};

const sum = Object.values(categoryRaw).reduce((acc, val) => acc + val, 0);
const normalized = Object.fromEntries(Object.entries(categoryRaw).map(([k, v]) => [k, v / sum]));

async function main() {
  const passwordHash = await bcrypt.hash('Buildana123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@buildana.com.au' },
    update: { passwordHash, role: Role.ADMIN },
    create: { email: 'admin@buildana.com.au', passwordHash, role: Role.ADMIN }
  });

  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {
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
      categoryPercents: { raw: categoryRaw, normalized }
    },
    create: {
      id: 'singleton',
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
      categoryPercents: { raw: categoryRaw, normalized }
    }
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
