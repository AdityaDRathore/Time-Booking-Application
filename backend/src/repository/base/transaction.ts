// src/repository/base/transaction.ts

import { PrismaClient } from '@prisma/client';


export const prisma = new PrismaClient(); // or wherever you initialize Prisma
import { Prisma } from "@prisma/client";

export async function runTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      return await callback(tx);
    });
  } catch (err) {
    console.error("Transaction failed:", err);
    throw err;
  }
}
