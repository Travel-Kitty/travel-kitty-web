/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { ok, fail } from "@/utils/response";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const exists = await prisma.trip.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) return fail("NOT_FOUND", "Trip not found", 404);

    const rows = await prisma.tripMember.findMany({
      where: { tripId: id },
      select: { wallet: true },
      orderBy: { joinedAt: "asc" },
    });
    return ok<{ wallets: string[] }>({ wallets: rows.map((r) => r.wallet) });
  } catch (e: any) {
    return fail("SERVER_ERROR", "Failed to load trip members", 500, {
      reason: e?.message,
    });
  }
}
