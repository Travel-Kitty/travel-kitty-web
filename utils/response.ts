import { NextResponse } from "next/server";
import type { ApiError, ApiResponse } from "@/types";

export function ok<T>(
  data: T,
  init?: ResponseInit,
  meta?: Record<string, unknown>
) {
  const body = meta
    ? { success: true, data, error: null, meta }
    : { success: true, data, error: null };
  return NextResponse.json(body, init) as NextResponse<ApiResponse<T>>;
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
  meta?: Record<string, unknown>
) {
  const payload: ApiError = {
    success: false,
    data: null,
    error: { code, message, details },
    ...(meta ? { meta } : {}),
  };
  return NextResponse.json(payload, { status });
}

// Tiny helpers to keep handlers tidy
export async function safeJson<T = unknown>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw { __isBadJson: true };
  }
}

export function isEthAddress(addr?: string) {
  return !!addr && addr.startsWith("0x") && addr.length === 42;
}
