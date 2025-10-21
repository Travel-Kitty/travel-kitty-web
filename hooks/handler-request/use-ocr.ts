import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/utils/fetcher";
import { OcrResult } from "@/types";

export function useOcrExtract() {
  return useMutation({
    mutationFn: async (args: { file: File; hint?: string }) => {
      const fd = new FormData();
      fd.append("image", args.file);
      if (args.hint) fd.append("hint", args.hint);

      const r = await fetch("/api/ocr", { method: "POST", body: fd });
      const payload = await r.json().catch(() => null);

      // standar: { success, data: { result }, error }
      if (!payload || !("success" in payload)) {
        throw new Error(
          r.ok ? "Malformed response" : `${r.status} ${r.statusText}`
        );
      }
      if (!payload.success) {
        const code = payload.error?.code ?? "OCR_FAILED";
        const message = payload.error?.message ?? "OCR request failed";
        throw new Error(`${code}: ${message}`);
      }
      return (payload.data?.result ?? payload.data) as OcrResult;
    },
  });
}
