import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env?.['NEON_DATABASE_CONNECTION_STRING'] as string,
    },
  },
});

export default prisma;
