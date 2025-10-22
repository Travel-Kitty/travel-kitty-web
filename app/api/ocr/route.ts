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

function contentToText(raw: unknown): string {
  if (Array.isArray(raw)) {
    return raw
      .map((c) =>
        c && typeof c === "object" && "text" in (c as any)
          ? String((c as any).text ?? "")
          : ""
      )
      .join("")
      .trim();
  }
  return typeof raw === "string" ? raw.trim() : "";
}

function stripFences(s: string): string {
  let t = s.trim();
  t = t.replace(/^```(?:json)?\s*/i, "");
  t = t.replace(/\s*```$/i, "");
  t = t.replace(/```(?:json)?/gi, "");
  return t.trim();
}

function findBalancedJson(s: string): string | null {
  const t = stripFences(s);
  const start = t.indexOf("{");
  if (start < 0) return null;
  let depth = 0,
    inStr = false,
    esc = false;
  for (let i = start; i < t.length; i++) {
    const ch = t[i];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return t.slice(start, i + 1); // balanced!
    }
  }
  return null;
}

function removeTrailingCommas(s: string): string {
  return s.replace(/,\s*(\}|\])/g, "$1");
}

function tryCloseBrackets(s: string): string {
  const t = stripFences(s);
  let inStr = false,
    esc = false,
    openCurl = 0,
    closeCurl = 0,
    openSq = 0,
    closeSq = 0;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "{") openCurl++;
    else if (ch === "}") closeCurl++;
    else if (ch === "[") openSq++;
    else if (ch === "]") closeSq++;
  }
  const addCurl = Math.max(0, openCurl - closeCurl);
  const addSq = Math.max(0, openSq - closeSq);
  return t + "]".repeat(addSq) + "}".repeat(addCurl);
}

function parseOcrJson(text: string): OcrResult {
  const t0 = stripFences(text);
  try {
    return JSON.parse(t0) as OcrResult;
  } catch {}
  const balanced = findBalancedJson(text);
  if (balanced) {
    try {
      return JSON.parse(removeTrailingCommas(balanced)) as OcrResult;
    } catch {}
  }
  const closed = tryCloseBrackets(text);
  try {
    return JSON.parse(removeTrailingCommas(closed)) as OcrResult;
  } catch {}
  throw new Error("FAILED_PARSE_JSON");
}

async function callOpenRouter(args: {
  key: string;
  model: string;
  dataUrl: string;
  hint?: string;
}): Promise<OcrResult> {
  const { key, model, dataUrl, hint } = args;

  const userPrompt = `
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
- Numbers must use dot decimal (e.g., 15.5) not commas.
${hint ? `- User hint: ${hint}` : ""}`.trim();

  const body = {
    model,
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "You are an OCR+IE assistant for receipts/invoices. Return ONLY valid JSON.",
          },
        ],
      },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    temperature: 0,
    max_tokens: 768,
    response_format: { type: "json_object" as const },
  };

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": APP_URL,
      "X-Title": APP_NAME,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text();
    const err = new Error(msg || `OpenRouter error ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }

  const data = await res.json();
  const raw =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ??
    "";

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as OcrResult;
  }

  const text = contentToText(raw);
  if (!text) throw new Error("EMPTY_OCR_RESPONSE");

  return parseOcrJson(text);
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
    const dataUrl = `data:${mime};base64,${b64}`;

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
