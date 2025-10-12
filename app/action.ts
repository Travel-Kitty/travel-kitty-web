"use server";

import { prisma } from "@/lib/prisma";

export async function recordExpense(params: {
  tripId: string;
  payer: string;
  amountUsd6: number;
  cid: string;
  txHash?: string;
}) {
  const { tripId, payer, amountUsd6, cid, txHash } = params;
  await prisma.expense.create({
    data: { tripId, payer, amountUsd6, cid, txHash },
  });
}
