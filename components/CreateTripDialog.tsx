/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
} from "wagmi/actions";
import { config } from "@/lib/wagmi";
import { ADDR, factoryAbi } from "@/lib/contracts";
import { makeCode6 } from "@/lib/code";
import { supabase } from "@/lib/supabase";
import { keccak256, toBytes, stringToHex } from "viem";
import { baseSepolia } from "wagmi/chains";

export function CreateTripDialog({ onCreated }: { onCreated?: () => void }) {
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function createTrip() {
    try {
      if (!name.trim()) return alert("Enter trip name");
      setBusy(true);

      // salt: derive from (address + name + timestamp) to avoid collisions
      const salt = keccak256(
        toBytes(`${address?.toLowerCase()}:${name}:${Date.now()}`)
      );

      const sim = await simulateContract(config, {
        address: ADDR.FACTORY,
        abi: factoryAbi,
        functionName: "createTrip",
        args: [salt],
      });
      const hash = await writeContract(config, sim.request);
      const receipt = await waitForTransactionReceipt(config, { hash });

      // Find created trip from logs (or get from return)
      const tripAddr =
        receipt.logs.map((l) => l.address).find((a) => a !== ADDR.FACTORY) ||
        (sim.result as `0x${string}`); // fallback

      const code6 = makeCode6();

      // store in Supabase
      const { error } = await supabase.from("trips").insert({
        name,
        code6,
        creator: address?.toLowerCase(),
        trip_address: tripAddr,
        tx_hash: hash,
        chain_id: baseSepolia.id,
      });
      if (error) throw error;

      setOpen(false);
      setName("");
      onCreated?.();
      alert(`✅ Trip created!\nCode: ${code6}\nAddress: ${tripAddr}`);
    } catch (e: any) {
      console.error(e);
      alert(`❌ ${e?.message ?? "Failed to create trip"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className="rounded-lg bg-white/10 px-4 py-2"
        onClick={() => setOpen(true)}
      >
        + Create Trip
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center">
          <div className="w-full max-w-md rounded-2xl bg-neutral-950 p-6 space-y-4">
            <h3 className="text-lg font-semibold">Create Trip</h3>
            <input
              className="w-full rounded-md bg-neutral-900 px-3 py-2"
              placeholder="Trip name, e.g., Bali 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-emerald-600 px-4 py-2"
                onClick={createTrip}
                disabled={busy}
              >
                {busy ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
