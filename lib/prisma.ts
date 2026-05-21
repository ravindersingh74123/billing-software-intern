import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not defined in the environment!");
  }

  const pool = new Pool({ connectionString: connectionString! });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

// In dev, always discard the stale singleton so a re-generated Prisma client
// (after `prisma generate`) is picked up immediately without a full server restart.
if (process.env.NODE_ENV !== "production") {
  delete (global as { prismaGlobal?: PrismaClient }).prismaGlobal;
}

export const prisma =
  global.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}