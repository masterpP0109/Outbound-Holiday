import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const globalDb = globalThis as unknown as { outboundDb?: PrismaClient };
export const db = globalDb.outboundDb ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalDb.outboundDb = db;
