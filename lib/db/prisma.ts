import { PrismaClient } from '@prisma/client';
import { env } from '@/lib/env';

void env;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
