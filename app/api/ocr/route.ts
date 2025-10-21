/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { ok, fail } from "@/utils/response";
import type { OcrResult } from "@/types";

export const runtime = "edge";

const BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const APP_URL = process.env.OPENROUTER_SITE_URL || "http://localhost";
const APP_NAME = process.env.OPENROUTER_APP_NAME || "Travel Kitty";
const MODEL =
  process.env.OPENROUTER_VISION_MODEL || "qwen/qwen2.5-vl-72b-instruct:free";

// Collect keys: OPENROUTER_API_KEY_1..9
const OPENROUTER_KEYS: string[] = Array.from({ length: 9 })
  .map((_, i) => process.env[`OPENROUTER_API_KEY_${i + 1}` as const])
  .filter((v): v is string => !!v);

// Edge-safe base64
function toBase64(ab: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(ab);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCodePoint(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// Extract first valid JSON object from a string (LLM sometimes adds prose)
function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      // ignore
    }
  }
  return null;
}

async function callOpenRouter(args: {
  key: string;
  model: string;
  dataUrl: string;
  hint?: string;
}): Promise<OcrResult> {
  const { key, model, dataUrl, hint } = args;

  const prompt = `
    You are an OCR+IE assistant for receipts/invoices. 
    Extract structured fields and return ONLY valid JSON (no prose):
    {
      "total": number,
      "currency": "USD" | "IDR" | "EUR" | "SGD" | "JPY" | string,
      "merchant": string | null,
      "items": [{"name": string, "qty": number|null, "price": number|null}] | [],
      "note": string | null
    }
    - Prefer the printed currency on the receipt; if missing, infer from context, default "USD".
    - Numbers must use dot decimal (e.g., 15.5) not commas. ${
      hint ? `- User hint: ${hint}` : ""
    }`.trim();

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": APP_URL,
      "X-Title": APP_NAME,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    const err = new Error(msg || `OpenRouter error ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }

  const json = await res.json();
  const content =
    json?.choices?.[0]?.message?.content ??
    json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ??
    "";

  if (typeof content === "object" && content) return content as OcrResult;

  if (typeof content === "string") {
    try {
      return JSON.parse(content) as OcrResult;
    } catch {
      const recovered = extractJson(content);
      if (recovered) return recovered as OcrResult;
      throw new Error("FAILED_PARSE_JSON");
    }
  }

  throw new Error("EMPTY_OCR_RESPONSE");
}

export async function POST(req: NextRequest) {
  try {
    if (!OPENROUTER_KEYS.length) {
      return fail("CONFIG_ERROR", "OPENROUTER_API_KEY_* not configured", 500);
    }

    const form = await req.formData();
    const file = form.get("image");
    const hint = (form.get("hint") as string | null) || undefined;

    if (!(file instanceof File)) {
      return fail(
        "VALIDATION_ERROR",
        'Missing "image" file in multipart/form-data',
        400
      );
    }

    const ab = await file.arrayBuffer();
    const b64 = toBase64(ab);
    const mime = file.type || "image/png";
    const dataUrl = `data:${mime};base64=${b64}`;

    let lastErr: any = null;
    for (const key of OPENROUTER_KEYS) {
      try {
        const result = await callOpenRouter({
          key,
          model: MODEL,
          dataUrl,
          hint,
        });
        return ok<{ result: OcrResult }>({ result });
      } catch (e: any) {
        lastErr = e;
        const status = e?.status ?? 0;
        if (status === 429 || (status >= 500 && status <= 599)) continue;
        break; // non-retryable
      }
    }

    return fail(
      lastErr?.code || "OCR_FAILED",
      lastErr?.message || "OCR failed",
      lastErr?.status ?? 502
    );
  } catch (e: any) {
    const isKnown = typeof e?.message === "string";
    return fail(
      "INTERNAL_ERROR",
      isKnown ? e.message : "Unexpected error",
      500
    );
  }
}
