"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
  readContract,
} from "wagmi/actions";
import { baseSepolia } from "wagmi/chains";
import Link from "next/link";
import { config } from "@/lib/wagmi";
import { ADDR, factoryAbi, faucetAbi } from "@/lib/contracts";

// ---------- small utils ----------
const basescanTx = (hash: string) => `https://sepolia.basescan.org/tx/${hash}`;

const makeCode6 = () =>
  Array.from(
    { length: 6 },
    () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
  ).join("");

function parseWagmiError(e: unknown): string {
  const err = e as any;
  // viem/wagmi sometimes put the human text in different places
  const parts: (string | undefined)[] = [
    err?.shortMessage,
    err?.cause?.reason,
    err?.cause?.shortMessage,
    Array.isArray(err?.cause?.metaMessages)
      ? err.cause.metaMessages.join("\n")
      : undefined,
    Array.isArray(err?.metaMessages) ? err.metaMessages.join("\n") : undefined,
    err?.details,
    err?.message,
  ];
  const msg = parts.find(Boolean);
  return msg ?? "unknown reason";
}

// ---------- types ----------
type TripRow = {
  id: string;
  name: string;
  code6: string;
  creator: string;
  tripAddress: string;
  createTxHash: string;
  chainId: number;
  joined?: boolean; // computed by API
  mine?: boolean; // computed by API (creator)
};

// API helper (adjust to your routes)
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const me = useMemo(() => address?.toLowerCase(), [address]);

  // ----- form states
  const [tripName, setTripName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"all" | "joined" | "mine">("all");

  // ----- tx states
  const [creating, setCreating] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  // ----- trips list
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // wagmi write (for completeness; we mostly use actions to await receipts)
  const { data: pendingHash } = useWriteContract();
  useWaitForTransactionReceipt({ hash: pendingHash });

  // ---------- load trips when connected / filters change ----------
  useEffect(() => {
    if (!isConnected) return;
    (async () => {
      try {
        setLoadingTrips(true);
        // Implement these server routes in your app:
        // GET /api/trips?query=&scope=all|joined|mine
        const rows = await api<TripRow[]>(
          `/api/trips?query=${encodeURIComponent(search)}&scope=${scope}`
        );
        setTrips(rows);
      } catch (e) {
        console.error("Load trips failed:", e);
      } finally {
        setLoadingTrips(false);
      }
    })();
  }, [isConnected, scope, search]);

  // ---------- claim faucet with cooldown explanation ----------
  async function handleClaim() {
    if (!address) return;
    setClaiming(true);
    setClaimMsg(null);
    try {
      // write & wait
      const sim = await writeContract(config, {
        address: ADDR.FAUCET,
        abi: faucetAbi,
        functionName: "claim",
        args: [],
      });
      const hash = await writeContract(config, sim.request);
      await waitForTransactionReceipt(config, { hash });
      setClaimMsg("✅ Claimed mUSD!");
    } catch (e) {
      // If cooldown, compute next allowed time
      let msg = parseWagmiError(e);
      if (/COOLDOWN/i.test(msg)) {
        try {
          const [last, cd] = await Promise.all([
            readContract(config, {
              address: ADDR.FAUCET,
              abi: faucetAbi,
              functionName: "lastClaim",
              args: [address],
            }) as Promise<bigint>,
            readContract(config, {
              address: ADDR.FAUCET,
              abi: faucetAbi,
              functionName: "cooldown",
            }) as Promise<bigint>,
          ]);
          const next = Number(last + cd) * 1000;
          msg = `⏳ COOLDOWN — try again at ${new Date(next).toLocaleString()}`;
        } catch (e2) {
          console.warn("cooldown detail failed:", e2);
        }
      }
      setClaimMsg(`❌ ${msg}`);
    } finally {
      setClaiming(false);
    }
  }

  // ---------- create trip via factory ----------
  async function handleCreateTrip() {
    if (!address) return;
    if (!tripName.trim()) return alert("Please enter a trip name");
    setCreating(true);
    try {
      const code6 = makeCode6();

      // 1) simulate to get the future address returned by factory
      const sim = await simulateContract(config, {
        address: ADDR.FACTORY,
        abi: factoryAbi,
        functionName: "createTrip",
        args: [address as `0x${string}`],
        chainId: baseSepolia.id,
        account: address as `0x${string}`,
      });

      // 2) send the tx and wait
      const hash = await writeContract(config, sim.request);
      await waitForTransactionReceipt(config, { hash });

      const tripAddr = sim.result as `0x${string}`;

      // 3) persist to DB
      await api("/api/trips", {
        method: "POST",
        body: JSON.stringify({
          name: tripName.trim(),
          code6,
          creator: me,
          tripAddress: tripAddr,
          createTxHash: hash,
          chainId: baseSepolia.id,
        }),
      });

      setTripName("");
      // refresh list
      const rows = await api<TripRow[]>(
        `/api/trips?query=${encodeURIComponent(search)}&scope=${scope}`
      );
      setTrips(rows);
      alert(`✅ Trip created! Code: ${code6}`);
    } catch (e) {
      alert(`❌ ${parseWagmiError(e)}`);
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  // ---------- join trip by 6-char code ----------
  async function handleJoinByCode() {
    if (!address) return;
    const code = joinCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code))
      return alert("Enter a valid 6-character code");
    try {
      await api("/api/trips/join", {
        method: "POST",
        body: JSON.stringify({ code6: code, wallet: me }),
      });
      setJoinCode("");
      const rows = await api<TripRow[]>(
        `/api/trips?query=${encodeURIComponent(search)}&scope=${scope}`
      );
      setTrips(rows);
      alert("✅ Joined trip!");
    } catch (e) {
      alert(`❌ ${parseWagmiError(e)}`);
      console.error(e);
    }
  }

  // ---------- render ----------
  return (
    <main className="space-y-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">🐾 Travel Kitty (Alpha)</h1>
        <ConnectButton />
      </header>

      {!isConnected ? (
        <div className="rounded-xl border border-neutral-800 p-6 text-center">
          <p className="text-neutral-400">
            Please connect your wallet to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Onboarding: Join + Claim */}
          <section className="rounded-xl border border-neutral-800 p-6 space-y-4">
            <h2 className="font-medium">1) Get Ready</h2>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Create trip */}
              <div className="rounded-lg border border-neutral-800 p-4 space-y-3">
                <label className="space-y-1 block">
                  <span className="text-sm text-neutral-400">Trip name</span>
                  <input
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className="w-full rounded-md bg-neutral-900 px-3 py-2"
                    placeholder="e.g., Bali Offsite"
                  />
                </label>
                <button
                  onClick={handleCreateTrip}
                  disabled={creating}
                  className="rounded-lg bg-white/10 px-4 py-2 disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create Trip"}
                </button>
                <p className="text-xs text-neutral-500">
                  A new on-chain kitty is deployed via the Factory. You’ll
                  receive a 6-char join code.
                </p>
              </div>

              {/* Join by code + faucet */}
              <div className="rounded-lg border border-neutral-800 p-4 space-y-3">
                <label className="space-y-1 block">
                  <span className="text-sm text-neutral-400">
                    Join with code
                  </span>
                  <div className="flex gap-2">
                    <input
                      value={joinCode}
                      onChange={(e) =>
                        setJoinCode(e.target.value.toUpperCase())
                      }
                      className="w-full rounded-md bg-neutral-900 px-3 py-2"
                      placeholder="ABC123"
                      maxLength={6}
                    />
                    <button
                      onClick={handleJoinByCode}
                      className="rounded-lg bg-white/10 px-4 py-2"
                    >
                      Join
                    </button>
                  </div>
                </label>

                <div className="pt-2 border-t border-neutral-800">
                  <button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="rounded-lg bg-emerald-600 px-4 py-2 disabled:opacity-50"
                  >
                    {claiming ? "Claiming…" : "Claim mUSD"}
                  </button>
                  {claimMsg && (
                    <p className="mt-2 text-sm">
                      {claimMsg.startsWith("✅") ? (
                        <span className="text-emerald-400">{claimMsg}</span>
                      ) : (
                        <span className="text-red-400">{claimMsg}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Trip list */}
          <section className="rounded-xl border border-neutral-800 p-6 space-y-4">
            <h2 className="font-medium">2) Trips</h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                {(["all", "joined", "mine"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setScope(k)}
                    className={`rounded-full px-3 py-1 text-sm border ${
                      scope === k
                        ? "border-white/80"
                        : "border-white/10 text-neutral-400"
                    }`}
                  >
                    {k === "all"
                      ? "All"
                      : k === "joined"
                      ? "Joined"
                      : "Created by me"}
                  </button>
                ))}
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="rounded-md bg-neutral-900 px-3 py-2 w-full sm:w-72"
              />
            </div>

            <div className="divide-y divide-neutral-800">
              {loadingTrips && (
                <p className="py-6 text-neutral-400">Loading…</p>
              )}
              {!loadingTrips && trips.length === 0 && (
                <p className="py-6 text-neutral-400">
                  No trips match your filter.
                </p>
              )}
              {trips.map((t) => (
                <div
                  key={t.id}
                  className="py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-neutral-400">
                      {t.mine
                        ? "You created this trip"
                        : t.joined
                        ? "You joined"
                        : "Public"}
                      {" · "}
                      <Link
                        href={basescanTx(t.createTxHash)}
                        target="_blank"
                        className="underline"
                      >
                        tx
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {t.mine && (
                      <button
                        onClick={() => navigator.clipboard.writeText(t.code6)}
                        className="rounded-md bg-white/10 px-3 py-1 text-sm"
                        title="Copy join code"
                      >
                        Code: {t.code6}
                      </button>
                    )}
                    <Link
                      href={`/trip/${t.id}`}
                      className="rounded-md bg-white/10 px-3 py-1 text-sm"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
