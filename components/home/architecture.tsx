import React from "react";
import { ChevronDown, Code, Layers, Terminal } from "lucide-react";

import { AuroraText } from "../ui/aurora-text";
import { MagicCard } from "../ui/magic-card";
import { Pointer } from "../ui/pointer";

export default function Architecture() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Technical <AuroraText>Architecture</AuroraText>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Built with modern, scalable technologies
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Frontend",
              icon: <Code className="h-6 w-6" />,
              items: [
                "Next.js 15 + TypeScript",
                "TailwindCSS + Motion",
                "Wagmi + Viem for Web3",
              ],
              color: "from-blue-500 to-cyan-500",
              emoji: "🧑‍💻",
            },
            {
              title: "Backend AI",
              icon: <Terminal className="h-6 w-6" />,
              items: [
                "FastAPI + Python",
                "Vision OCR for receipts",
                "Realtime FX rates API",
                "IPFS for storage",
              ],
              color: "from-purple-500 to-pink-500",
              emoji: "🧠",
            },
            {
              title: "Blockchain",
              icon: <Layers className="h-6 w-6" />,
              items: [
                "Solidity smart contracts",
                "Base Sepolia testnet",
                "Event driven architecture",
                "Foundry for testing",
              ],
              color: "from-green-500 to-emerald-500",
              emoji: "🔗",
            },
          ].map((arch, idx) => (
            <MagicCard
              key={idx}
              className="rounded-2xl border-[var(--tk-card)] p-6 custom-cursor"
            >
              <div
                className={`inline-flex rounded-xl bg-gradient-to-r ${arch.color} p-3 text-white`}
              >
                {arch.icon}
              </div>
              <h3 className="mt-3 text-lg sm:text-xl font-semibold">
                {arch.title}
              </h3>
              <ul className="mt-2 space-y-2">
                {arch.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronDown className="mt-0.5 h-4 w-4 rotate-[-90deg] text-muted-foreground" />
                    <span className="text-muted-foreground">{it}</span>
                  </li>
                ))}
              </ul>
              <Pointer>
                <div className="text-2xl">{arch.emoji}</div>
              </Pointer>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  );
}
