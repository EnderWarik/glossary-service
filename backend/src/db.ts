import { PrismaClient } from '@prisma/client';
import { config } from './config';

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL must be setÏ');
}

export const prisma = new PrismaClient({
  log: config.appEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

