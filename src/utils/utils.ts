import { Prisma } from "@prisma/client";
import prisma from "./db";

export async function createOrReturnTransaction<T>(
  transaction: Prisma.TransactionClient | null | undefined,
  callback: (transaction: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  if (transaction) {
    return callback(transaction);
  }
  return prisma.$transaction((tx: Prisma.TransactionClient) => callback(tx));
}
