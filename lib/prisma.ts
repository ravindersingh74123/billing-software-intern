import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prismaClientSingleton = () => {
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