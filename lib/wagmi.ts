"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Travel Kitty",
  projectId: "travel-kitty", // if using WalletConnect cloud use real ID
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
});
