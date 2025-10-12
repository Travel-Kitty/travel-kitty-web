import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { RQProvider } from "@/lib/react-query";
import { config } from "@/lib/wagmi";
import { headers } from "next/headers";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";

export const metadata = {
  title: "Travel Kitty",
  description: "Split & settle on Base",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR hint so RainbowKit can render correctly in Next 15
  headers();

  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <WagmiProvider config={config}>
          <RQProvider>
            <RainbowKitProvider>
              <div className="mx-auto max-w-4xl p-6">{children}</div>
            </RainbowKitProvider>
          </RQProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
