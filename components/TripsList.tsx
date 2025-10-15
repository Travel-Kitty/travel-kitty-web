"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";

type Trip = {
  id: string;
  name: string;
  code6: string;
  creator: string;
  trip_address: string;
  tx_hash: string;
  created_at: string;
  chain_id: number;
};

export function TripsList() {
  const { address } = useAccount();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "mine" | "joined">("all");
  const [trips, setTrips] = useState<Trip[]>([]);
  const my = address?.toLowerCase();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });
      setTrips((data as any) || []);
    })();
  }, []);

  const filtered = useMemo(() => {
    let rows = trips;
    if (q)
      rows = rows.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));
    if (tab === "mine") rows = rows.filter((t) => t.creator === my);
    if (tab === "joined") {
      // Simple heuristic: joined = not creator and you have an entry in trip_members (optional)
      // For hackathon, show non-creator trips; refine by querying trip_members if you saved it.
      rows = rows.filter((t) => t.creator !== my);
    }
    return rows;
  }, [trips, q, tab, my]);

  function basescan(tx: string, chainId: number) {
    return chainId === 84532
      ? `https://sepolia.basescan.org/tx/${tx}`
      : `https://basescan.org/tx/${tx}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="rounded-md bg-neutral-900 px-3 py-2"
          placeholder="Search trips"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex gap-2">
          {(["all", "mine", "joined"] as const).map((t) => (
            <button
              key={t}
              className={`px-3 py-1 rounded-md ${
                tab === t ? "bg-white/15" : "bg-white/5"
              }`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {filtered.map((t) => (
          <li
            key={t.id}
            className="rounded-xl border border-neutral-800 p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{t.name}</h3>
              {t.creator === my && (
                <button
                  className="text-xs bg-white/10 px-2 py-1 rounded"
                  onClick={() => navigator.clipboard.writeText(t.code6)}
                >
                  Code: {t.code6} 📋
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-400 break-all">
              Address: {t.trip_address}
            </p>
            <a
              className="text-xs text-emerald-400 underline"
              href={basescan(t.tx_hash, t.chain_id)}
              target="_blank"
            >
              Tx on BaseScan ↗
            </a>
            <div>
              <a
                href={`/trip/${t.id}`}
                className="text-sm bg-white/10 px-3 py-1 rounded"
              >
                Open
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
