/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/trips/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// optional: non-cache untuk dev
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      code6,
      creator, // wallet address (0x..)
      tripAddress, // address dari factory (0x..)
      createTxHash, // tx hash di basescan
      chainId, // 84532
    } = body || {};

    // validasi sederhana
    if (!name || !code6 || !creator || !tripAddress) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const wallet = String(creator).toLowerCase();
    const addr = String(tripAddress).toLowerCase();

    // pastikan User ada (hindari FK error)
    await prisma.user.upsert({
      where: { wallet },
      update: {},
      create: { wallet },
    });

    // simpan trip
    const trip = await prisma.trip.create({
      data: {
        name,
        code6,
        creator: wallet,
        tripAddress: addr, // kolom addr di Trip (lihat §2)
        chainId: chainId ?? 84532,
        createTxHash: createTxHash ?? null,
      },
    });

    // owner otomatis jadi member
    await prisma.tripMember.create({
      data: { tripId: trip.id, wallet },
    });

    return NextResponse.json({ ok: true, trip }, { status: 201 });
  } catch (e: any) {
    // tangani error prisma agar jelas
    if (e?.code === "P2002") {
      // unique constraint (mis. code6 sudah dipakai)
      return NextResponse.json(
        { error: "DUPLICATE", details: e?.meta },
        { status: 409 }
      );
    }
    console.error("POST /api/trips failed:", e);
    return NextResponse.json(
      { error: e?.message ?? "SERVER_ERROR" },
      { status: 500 }
    );
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

    // base filter by name
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
        where: {
          ...whereName,
          members: { some: { wallet: me } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      trips = await prisma.trip.findMany({
        where: whereName,
        orderBy: { createdAt: "desc" },
      });
    }

    // mark joined/mine flags
    const ids = trips.map((t) => t.id);
    const joinedSet = new Set<string>();
    if (me && ids.length) {
      const memberships = await prisma.tripMember.findMany({
        where: { tripId: { in: ids }, wallet: me },
        select: { tripId: true },
      });
      memberships.forEach((m) => joinedSet.add(m.tripId));
    }

    const rows = trips.map((t) => ({
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

    return NextResponse.json(rows);
  } catch (e: any) {
    console.error("GET /api/trips failed:", e);
    return NextResponse.json(
      { error: e?.message ?? "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
