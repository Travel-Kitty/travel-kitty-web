/* eslint-disable @typescript-eslint/no-explicit-any */
import { ok, fail, safeJson, isEthAddress } from "@/utils/response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type JoinInput = { code6?: string; wallet?: string };

export async function POST(req: Request) {
  try {
    const { code6, wallet } = (await safeJson<JoinInput>(req)) || {};

    if (!code6 || !/^[A-Z0-9]{6}$/.test(code6)) {
      return fail("INVALID_CODE", "code6 must be 6 chars [A-Z0-9]", 400);
    }
    if (!isEthAddress(wallet)) {
      return fail("INVALID_WALLET", "wallet must be a valid 0x address", 400);
    }

    const me = wallet!.toLowerCase();

    const trip = await prisma.trip.findUnique({ where: { code6 } });
    if (!trip) {
      return fail("TRIP_NOT_FOUND", "Trip not found", 404);
    }

    await prisma.user.upsert({
      where: { wallet: me },
      update: {},
      create: { wallet: me },
    });

    await prisma.tripMember.upsert({
      where: { tripId_wallet: { tripId: trip.id, wallet: me } },
      update: {},
      create: { tripId: trip.id, wallet: me },
    });

    return ok<{ tripId: string }>({ tripId: trip.id });
  } catch (e: any) {
    if (e?.__isBadJson) {
      return fail("BAD_JSON", "Request body must be valid JSON", 400);
    }
    return fail("JOIN_FAILED", "Failed to join trip", 500, {
      reason: e?.message,
    });
  }
}
