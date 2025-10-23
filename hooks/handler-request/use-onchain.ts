import { useQuery } from "@tanstack/react-query";
import { readContract } from "wagmi/actions";
import { config } from "@/lib/wagmi";
import { travelKittyAbi } from "@/lib/contracts";

export function useOnchainMembers(tripAddress?: `0x${string}` | string | null) {
  return useQuery({
    queryKey: ["onchain-members", (tripAddress ?? "").toLowerCase()],
    enabled: !!tripAddress,
    queryFn: async () => {
      const addrs = await readContract(config, {
        address: tripAddress as `0x${string}`,
        abi: travelKittyAbi,
        functionName: "getMembers",
      });
      return addrs as string[];
    },
    staleTime: 30_000,
  });
}
