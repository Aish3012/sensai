import prismaClient from "./generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const { PrismaClient } = prismaClient;

const globalForPrisma = globalThis;

function createPrismaClient() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        },
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
