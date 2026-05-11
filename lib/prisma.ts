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

  return new PrismaClient({
    adapter,
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaGlobal ?? prismaClientSingleton();

// ✅ IMPORTANT: assign in dev to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}