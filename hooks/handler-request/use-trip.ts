import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/utils/fetcher";
import { TripRow } from "@/types";

export function useTripList(params: {
  query: string;
  scope: "all" | "joined" | "mine";
  me?: string | null;
  enabled?: boolean;
}) {
  const { query, scope, me, enabled = true } = params;
  const qsp = useMemo(() => {
    const p = new URLSearchParams({
      query,
      scope,
      me: (me ?? "").toLowerCase(),
    }).toString();
    return `/api/trips?${p}`;
  }, [query, scope, me]);

  return useQuery({
    queryKey: ["trips", { query, scope, me: (me ?? "").toLowerCase() }],
    queryFn: async () => {
      const res = await apiFetch<{ items: TripRow[] }>(qsp);
      return res.items;
    },
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      code6: string;
      creator: string;
      tripAddress: `0x${string}`;
      createTxHash: string;
      chainId?: number;
      currency?: string;
      items?: { name: string; qty?: number; unitPrice?: number }[];
      imageDataUrl?: string | null;
      total?: number;
    }) => {
      return apiFetch<unknown>("/api/trips", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useJoinTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code6: string; wallet: string }) => {
      return apiFetch<{ tripId: string }>("/api/trips/join", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
