import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // TODO: parse formdata; call OpenRouter model vision; return JSON
  // Untuk demo kembalikan dummy
  return NextResponse.json({ total: 15.0, currency: "USD", merchant: "Demo" });
}
