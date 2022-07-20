import { PrismaClient } from "@prisma/client";

// Enforce that the PrismaClient is a singleton.
declare global {
	var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
