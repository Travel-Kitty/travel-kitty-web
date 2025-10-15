"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;

export const config = getDefaultConfig({
  appName: "Travel Kitty",
  projectId,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
});
