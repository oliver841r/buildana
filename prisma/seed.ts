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
    create: {
      email: 'admin@buildana.com.au',
      passwordHash,
      role: Role.ADMIN
    }
  });

  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {
      specCostPerSqm: { STANDARD: 1850, MID: 2400, PREMIUM: 3200 },
      siteMultiplier: { FLAT: 1, MODERATE: 1.08, COMPLEX: 1.18 },
      addOnDefaults: {
        POOL: { flatCost: 65000 },
        HIGH_CEILINGS: { multiplier: 1.05 },
        UPGRADED_WINDOWS: { flatCost: 18000 },
        SMART_HOME: { flatCost: 22000 },
        LANDSCAPING_PREMIUM: { flatCost: 30000 }
      },
      categoryPercents: { raw: categoryRaw, normalized }
    },
    create: {
      id: 'singleton',
      specCostPerSqm: { STANDARD: 1850, MID: 2400, PREMIUM: 3200 },
      siteMultiplier: { FLAT: 1, MODERATE: 1.08, COMPLEX: 1.18 },
      addOnDefaults: {
        POOL: { flatCost: 65000 },
        HIGH_CEILINGS: { multiplier: 1.05 },
        UPGRADED_WINDOWS: { flatCost: 18000 },
        SMART_HOME: { flatCost: 22000 },
        LANDSCAPING_PREMIUM: { flatCost: 30000 }
      },
      categoryPercents: { raw: categoryRaw, normalized }
    }
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
