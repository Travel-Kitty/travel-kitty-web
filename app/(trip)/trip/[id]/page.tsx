"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";
import { readContract } from "wagmi/actions";
import { config } from "@/lib/wagmi";
import { travelKittyAbi } from "@/lib/contracts";

export default function TripPage({ params }: { params: { id: string } }) {
  const { address } = useAccount();
  const [trip, setTrip] = useState<any>(null);
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("trips")
        .select("*")
        .eq("id", params.id)
        .single();
      setTrip(data);
      if (data?.trip_address) {
        const addrs = await readContract(config, {
          address: data.trip_address,
          abi: travelKittyAbi,
          functionName: "getMembers",
        });
        setMembers(addrs as string[]);
      }
    })();
  }, [params.id]);

  const amCreator = trip && address?.toLowerCase() === trip.creator;

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">{trip?.name ?? "Trip"}</h1>
      <p className="text-sm text-neutral-400">
        Trip Address: {trip?.trip_address}
      </p>
      {amCreator && (
        <div className="rounded-xl border border-neutral-800 p-4 space-y-2">
          <h2 className="font-medium">Members</h2>
          <ul className="text-sm space-y-1">
            {members.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="text-xs text-neutral-400">
            When everyone has joined, proceed to recording expenses and
            settlement.
          </p>
        </div>
      )}
    </main>
  );
}
