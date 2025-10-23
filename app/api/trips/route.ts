/* eslint-disable @typescript-eslint/no-explicit-any */
import { ok, fail, safeJson, isEthAddress } from "@/utils/response";
import type { CreateTripInput, TripRow } from "@/types/trip";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await safeJson<
      CreateTripInput & {
        currency?: string;
        items?: { name: string; qty?: number; unitPrice?: number }[];
        imageDataUrl?: string | null;
        total?: number;
      }
    >(req);

    const { name, code6, creator, tripAddress, createTxHash, chainId } =
      body || {};

    if (!name || !code6 || !creator || !tripAddress) {
      return fail(
        "MISSING_FIELDS",
        "name, code6, creator, tripAddress are required",
        400
      );
    }
    if (!/^[A-Z0-9]{6}$/.test(code6)) {
      return fail("INVALID_CODE", "code6 must be 6 chars [A-Z0-9]", 400);
    }
    if (!isEthAddress(creator) || !isEthAddress(tripAddress)) {
      return fail(
        "INVALID_ADDRESS",
        "creator/tripAddress must be valid 0x address",
        400
      );
    }

    const wallet = creator.toLowerCase();
    const addr = tripAddress.toLowerCase();

    await prisma.user.upsert({
      where: { wallet },
      update: {},
      create: { wallet },
    });

    const trip = await prisma.trip.create({
      data: {
        name,
        code6,
        creator: wallet,
        tripAddress: addr,
        chainId: chainId ?? 84532,
        createTxHash: createTxHash ?? "",
      },
    });

    await prisma.tripMember.create({ data: { tripId: trip.id, wallet } });

    // ---- optional: save receipt (currency + items) ----
    if (body?.currency && Array.isArray(body.items) && body.items.length > 0) {
      // compute total if not provided
      const total =
        typeof body.total === "number"
          ? body.total
          : body.items.reduce(
              (s, it) => s + Number(it.unitPrice ?? 0) * Number(it.qty ?? 1),
              0
            );

      let imageUrl: string | undefined = undefined;

      // (optional) store image to Vercel Blob if data URL provided
      // Requires @vercel/blob and env BLOB_READ_WRITE_TOKEN on Vercel
      if (body.imageDataUrl) {
        try {
          const [meta, b64] = body.imageDataUrl.split(",", 2);
          const mime =
            /data:(.*?);base64/.exec(meta || "")?.[1] || "image/jpeg";
          const bytes = Buffer.from(b64 || "", "base64");
          const fileName = `receipts/${trip.id}-${Date.now()}.jpg`;
          const saved = await put(fileName, bytes, {
            access: "public",
            contentType: mime,
          });
          imageUrl = saved.url;
        } catch (e) {
          // If blob not configured, just ignore image store
          console.warn("blob upload skipped:", e);
        }
      }

      await prisma.receipt.create({
        data: {
          tripId: trip.id,
          currency: body.currency,
          items: body.items,
          total,
          imageUrl,
        },
      });
    }

    return ok<typeof trip>(trip, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return fail("DUPLICATE", "Unique constraint violated", 409, e?.meta);
    }
    if (e?.__isBadJson) {
      return fail("BAD_JSON", "Request body must be valid JSON", 400);
    }
    return fail("SERVER_ERROR", "Failed to create trip", 500, {
      reason: e?.message,
    });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || "").trim();
    const scope = (searchParams.get("scope") || "all") as
      | "all"
      | "joined"
      | "mine";
    const me = (searchParams.get("me") || "").toLowerCase();

    const whereName =
      query.length > 0
        ? { name: { contains: query, mode: "insensitive" as const } }
        : {};

    let trips;
    if (scope === "mine" && me) {
      trips = await prisma.trip.findMany({
        where: { ...whereName, creator: me },
        orderBy: { createdAt: "desc" },
      });
    } else if (scope === "joined" && me) {
      trips = await prisma.trip.findMany({
        where: { ...whereName, members: { some: { wallet: me } } },
        orderBy: { createdAt: "desc" },
      });
    } else {
      trips = await prisma.trip.findMany({
        where: whereName,
        orderBy: { createdAt: "desc" },
      });
    }

    const ids = trips.map((t) => t.id);
    const joinedSet = new Set<string>();
    if (me && ids.length) {
      const memberships = await prisma.tripMember.findMany({
        where: { tripId: { in: ids }, wallet: me },
        select: { tripId: true },
      });
      for (const m of memberships) {
        joinedSet.add(m.tripId);
      }
    }

    const items: TripRow[] = trips.map((t) => ({
      id: t.id,
      name: t.name,
      code6: t.code6,
      creator: t.creator,
      tripAddress: t.tripAddress,
      createTxHash: t.createTxHash ?? "",
      chainId: t.chainId,
      joined: me ? joinedSet.has(t.id) : false,
      mine: me ? t.creator === me : false,
    }));

    return ok<{ items: TripRow[] }>({ items }, undefined, {
      count: items.length,
      scope,
      query,
      me,
    });
  } catch (e: any) {
    return fail("SERVER_ERROR", "Failed to fetch trips", 500, {
      reason: e?.message,
    });
  }
}
