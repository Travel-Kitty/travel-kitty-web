import React from "react";
import { BarChart3, Globe, Lock, Shield, Sparkles, Zap } from "lucide-react";

import { AuroraText } from "../ui/aurora-text";
import { MagicCard } from "../ui/magic-card";
import { Pointer } from "../ui/pointer";

export default function Features() {
  return (
    <section id="features" className="px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Why <AuroraText>Travel Kitty</AuroraText>?
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-balance text-sm sm:text-base lg:text-lg text-muted-foreground">
            Combining AI intelligence with blockchain transparency to solve
            group expense tracking forever.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Sparkles className="h-6 w-6" />,
              title: "AI Powered OCR",
              description:
                "Snap a photo of any receipt. Our AI extracts amounts, currencies, and items instantly.",
              color: "from-blue-500 to-cyan-500",
              emoji: "🤖",
            },
            {
              icon: <Shield className="h-6 w-6" />,
              title: "Onchain Proof",
              description:
                "Every transaction is recorded on Base blockchain with verifiable smart contracts.",
              color: "from-purple-500 to-pink-500",
              emoji: "🔗",
            },
            {
              icon: <Globe className="h-6 w-6" />,
              title: "Multi Currency",
              description:
                "Automatic FX conversion using realtime rates. No more manual calculations.",
              color: "from-green-500 to-emerald-500",
              emoji: "🌍",
            },
            {
              icon: <Zap className="h-6 w-6" />,
              title: "Instant Settlement",
              description:
                "One click net settlement. Everyone gets paid or pays their exact share.",
              color: "from-yellow-500 to-orange-500",
              emoji: "⚡",
            },
            {
              icon: <Lock className="h-6 w-6" />,
              title: "Privacy First",
              description:
                "Receipt images on IPFS, only hashes onchain. Your data stays private.",
              color: "from-red-500 to-pink-500",
              emoji: "🔒",
            },
            {
              icon: <BarChart3 className="h-6 w-6" />,
              title: "Realtime Analytics",
              description:
                "Track spending patterns, export reports, and visualize expense distribution.",
              color: "from-indigo-500 to-blue-500",
              emoji: "📊",
            },
          ].map((feature, idx) => (
            <MagicCard
              key={idx}
              className="group rounded-2xl border-[var(--tk-card)] p-6 transition-all hover:shadow-lg custom-cursor"
              data-animate
            >
              <div
                className={`mb-3 inline-flex rounded-xl bg-gradient-to-r ${feature.color} p-3 text-white`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {feature.description}
              </p>
              <Pointer>
                <div className="text-2xl">{feature.emoji}</div>
              </Pointer>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  );
}
