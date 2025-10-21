/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });

  let payload: any = null;
  try {
    payload = await r.json();
  } catch {
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return payload as T;
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    if (payload.success) return payload.data as T;
    const code = payload.error?.code ?? "API_ERROR";
    const message = payload.error?.message ?? "Request failed";
    const formattedDetails =
      typeof payload.error.details === "string"
        ? payload.error.details
        : JSON.stringify(payload.error.details);
    const details =
      payload.error?.details === undefined ? "" : ` — ${formattedDetails}`;
    throw new Error(`${code}: ${message}${details}`);
  }

  if (!r.ok) {
    throw new Error(
      typeof payload === "string" ? payload : JSON.stringify(payload)
    );
  }
  return payload as T;
}
