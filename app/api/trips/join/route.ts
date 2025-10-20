/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/trips/join/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // pastikan file ini export prisma client

export async function POST(req: Request) {
  try {
    const { code6, wallet } = (await req.json()) as {
      code6?: string;
      wallet?: string;
    };

    if (!code6 || !/^[A-Z0-9]{6}$/.test(code6))
      return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });

    if (!wallet || !wallet.startsWith("0x") || wallet.length !== 42)
      return NextResponse.json({ error: "INVALID_WALLET" }, { status: 400 });

    const me = wallet.toLowerCase();

    // 1) cari trip
    const trip = await prisma.trip.findUnique({ where: { code6 } });
    if (!trip)
      return NextResponse.json({ error: "TRIP_NOT_FOUND" }, { status: 404 });

    // 2) pastikan user ada
    await prisma.user.upsert({
      where: { wallet: me },
      update: {},
      create: { wallet: me },
    });

    // 3) join (idempotent)
    await prisma.tripMember.upsert({
      where: { tripId_wallet: { tripId: trip.id, wallet: me } },
      update: {},
      create: { tripId: trip.id, wallet: me },
    });

    return NextResponse.json({ ok: true, tripId: trip.id });
  } catch (e: any) {
    console.error("join error:", e);
    return NextResponse.json(
      { error: e?.message ?? "JOIN_FAILED" },
      { status: 500 }
    );
  }
}
