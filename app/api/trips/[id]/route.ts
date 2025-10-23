import { ok, fail } from "@/utils/response";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const row = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        receipts: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            currency: true,
            items: true,
            total: true,
            imageUrl: true,
            createdAt: true,
          },
        },
      },
    });
    if (!row) return fail("NOT_FOUND", "Trip not found", 404);

    const { receipts, ...trip } = row as any;
    const latestReceipt = receipts?.[0] ?? null;

    return ok({
      id: trip.id,
      name: trip.name,
      code6: trip.code6,
      creator: trip.creator,
      tripAddress: trip.tripAddress,
      createTxHash: trip.createTxHash,
      chainId: trip.chainId,
      createdAt: trip.createdAt,
      latestReceipt,
    });
  } catch (e: any) {
    return fail("SERVER_ERROR", "Failed to load trip", 500, {
      reason: e?.message,
    });
  }
}
