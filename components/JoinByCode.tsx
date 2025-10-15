"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";
import { travelKittyAbi } from "@/lib/contracts";
import { config } from "@/lib/wagmi";
import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
} from "wagmi/actions";

export function JoinByCode({ onJoined }: { onJoined?: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function join() {
    try {
      setBusy(true);
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("code6", code.trim().toUpperCase())
        .single();
      if (error || !data) throw new Error("Trip not found");

      const tripAddress = data.trip_address as `0x${string}`;

      const sim = await simulateContract(config, {
        address: tripAddress,
        abi: travelKittyAbi,
        functionName: "join",
      });
      const hash = await writeContract(config, sim.request);
      await waitForTransactionReceipt(config, { hash });

      // store membership (optional – also derivable from events)
      await supabase.from("trip_members").insert({
        trip_id: data.id,
        member: (window as any).ethereum.selectedAddress?.toLowerCase(),
      });

      onJoined?.();
      alert("✅ Joined trip!");
    } catch (e: any) {
      console.error(e);
      alert(`❌ ${e?.message ?? "Join failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <input
        className="rounded-md bg-neutral-900 px-3 py-2 uppercase tracking-widest"
        placeholder="ABC123"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        className="rounded-lg bg-white/10 px-4 py-2"
        onClick={join}
        disabled={busy}
      >
        Join by Code
      </button>
    </div>
  );
}
