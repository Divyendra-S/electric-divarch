import { PrismaClient } from "../../prisma/generated/client";
// import { dbUrl } from "./constants";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
