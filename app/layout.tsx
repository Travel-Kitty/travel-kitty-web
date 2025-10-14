import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { headers } from "next/headers";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { RQProvider } from "@/lib/react-query";
import { config } from "@/lib/wagmi";

export const metadata = {
  title: "Travel Kitty",
  description: "Split & settle on Base",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  headers();

  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <WagmiProvider config={config}>
          <RQProvider>
            <RainbowKitProvider>
              <div
              // className="mx-auto max-w-4xl p-6"
              >
                {children}
              </div>
            </RainbowKitProvider>
          </RQProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
