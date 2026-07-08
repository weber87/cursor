import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

export { todayString, sumMacros, formatDate } from "./constants";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  adapter: PrismaBetterSqlite3;
};

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getOrCreateUser() {
  let user = await prisma.userProfile.findFirst();
  if (!user) {
    user = await prisma.userProfile.create({
      data: { name: "You" },
    });
  }
  return user;
}
