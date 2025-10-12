"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ADDR, faucetAbi, erc20Abi, travelKittyAbi } from "@/lib/contracts";
import { putToIpfs } from "@/lib/helia";
import { useState } from "react";
import { parseUnits } from "viem";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("15.00");
  const [split, setSplit] = useState<string>("");
  const [ocr, setOcr] = useState<any>(null);
  const [img, setImg] = useState<File | null>(null);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function handleJoin() {
    writeContract({
      address: ADDR.TRAVEL_KITTY,
      abi: travelKittyAbi,
      functionName: "join",
      args: [],
    });
  }

  async function handleFaucet() {
    writeContract({
      address: ADDR.FAUCET,
      abi: faucetAbi,
      functionName: "claim",
      args: [],
    });
  }

  async function handleAddExpense() {
    if (!img) return alert("Choose a receipt image");
    // (A) Upload OCR JSON or raw image to IPFS via Helia
    // Stub OCR: in demo we store a minimal JSON {total, note}
    const receipt = JSON.stringify({
      total: amount,
      note: "demo",
      ocr: ocr ?? null,
    });
    const cid = await putToIpfs(receipt);

    // (B) Build splitWith array
    const addrs = split
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as `0x${string}`[];
    if (addrs.length === 0)
      return alert("Add at least one address in Split-With");

    // (C) USD*1e6
    const usd6 = Number(amount) * 1_000_000;
    writeContract({
      address: ADDR.TRAVEL_KITTY,
      abi: travelKittyAbi,
      functionName: "addExpense",
      args: [BigInt(Math.round(usd6)), new TextEncoder().encode(cid), addrs],
    });
  }

  async function handleSettle(creditor: `0x${string}`) {
    const usd6 = parseUnits("7.5", 6); // demo settle $7.5
    // approve kitty
    writeContract({
      address: ADDR.MOCK_USD,
      abi: erc20Abi,
      functionName: "approve",
      args: [ADDR.TRAVEL_KITTY, usd6],
    });
    // then settle (tip: in production chain them or wait receipt)
    writeContract({
      address: ADDR.TRAVEL_KITTY,
      abi: travelKittyAbi,
      functionName: "settleToken",
      args: [creditor, usd6, ADDR.MOCK_USD],
    });
  }

  return (
    <main className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">🐾 Travel Kitty (Alpha)</h1>
        <ConnectButton />
      </header>

      <section className="rounded-2xl border border-neutral-800 p-6 space-y-4">
        <h2 className="font-medium">1) Get Ready</h2>
        <div className="flex gap-3">
          <button
            onClick={handleJoin}
            className="rounded-lg bg-white/10 px-4 py-2"
          >
            Join Trip
          </button>
          <button
            onClick={handleFaucet}
            className="rounded-lg bg-white/10 px-4 py-2"
          >
            Claim mUSD
          </button>
        </div>
        <p className="text-sm text-neutral-400">
          Join emits <code>MemberJoined</code>. Faucet mints test mUSD to your
          wallet (cooldown applies).
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-800 p-6 space-y-4">
        <h2 className="font-medium">2) Add Expense</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm text-neutral-400">Total (USD)</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md bg-neutral-900 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-neutral-400">
              Split with (comma addresses)
            </span>
            <input
              value={split}
              onChange={(e) => setSplit(e.target.value)}
              placeholder="0xabc...,0xdef..."
              className="w-full rounded-md bg-neutral-900 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-neutral-400">
              Receipt Image (demo)
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImg(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <button
          onClick={handleAddExpense}
          className="rounded-lg bg-emerald-600 px-4 py-2"
        >
          Add Expense → IPFS + on-chain
        </button>

        {(isPending || mining) && <p className="text-sm">Tx pending…</p>}
        {isSuccess && (
          <p className="text-sm text-emerald-400">Success! Tx: {hash}</p>
        )}
        {error && (
          <p className="text-sm text-red-400">
            {String(error.shortMessage ?? error.message)}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-800 p-6 space-y-4">
        <h2 className="font-medium">3) Settle (demo)</h2>
        <p className="text-sm text-neutral-400">
          Approve mUSD then settle a sample $7.5 to a creditor.
        </p>
        <input
          placeholder="Creditor Address"
          onChange={() => {}}
          id="cred"
          className="w-full rounded-md bg-neutral-900 px-3 py-2 mb-3"
        />
        <button
          onClick={() => {
            const cred = (document.getElementById("cred") as HTMLInputElement)
              .value as `0x${string}`;
            if (!cred) return alert("Fill creditor");
            handleSettle(cred);
          }}
          className="rounded-lg bg-white/10 px-4 py-2"
        >
          Approve + Settle $7.5
        </button>
      </section>
    </main>
  );
}
