import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb"; // 引入 Prisma MariaDB 适配器
import { PrismaClient } from "./generated/prisma/client";// 引入 Prisma Client

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || "3306"),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };
