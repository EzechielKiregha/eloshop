import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import 'dotenv/config'

const prismaClientSingleton = () => {
	return new PrismaClient({
		accelerateUrl: `${process.env.DATABASE_URL}`,
		transactionOptions: {
			timeout: 14000,
			maxWait: 15000,
		},
	}).$extends(withAccelerate());
};

declare const globalThis: {
	prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma };

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;