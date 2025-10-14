import React from "react";
import { Activity, ArrowRight, Play } from "lucide-react";

import { AuroraText } from "../ui/aurora-text";
import { MagicCard } from "../ui/magic-card";
import { SpinningText } from "../ui/spinning-text";
import FloatingElement from "./floating-element";

export default function Hero() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6 animate-slide-up" data-animate id="hero-copy">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs">
            <Activity className="h-4 w-4 text-green-500" />
            <span>Built on Base Sepolia • Web3 + AI Powered</span>
          </div>

          <h1 className="font-bold leading-tight text-4xl sm:text-5xl lg:text-6xl">
            Split Travel Expenses <AuroraText>Instantly</AuroraText> with AI &
            Blockchain
          </h1>

          <p className="max-w-2xl text-balance text-base sm:text-lg lg:text-xl text-muted-foreground">
            Smart wallet pools for your trips. AI powered receipt scanning,
            automatic currency conversion, and transparent onchain settlement
            you can verify.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm sm:text-base font-semibold text-white transition-transform hover:scale-105">
              <span>Try Live Demo</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/50 px-6 py-3 text-sm sm:text-base font-semibold hover:bg-muted/60">
              <Play className="h-5 w-5" />
              <span>Watch Demo</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Next.js", "Base", "AI OCR", "IPFS", "Smart Contracts"].map(
              (tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-xs"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>

        {/* Device preview using MagicUI Android mock */}
        <div className="relative">
          <FloatingElement>
            <MagicCard className="rounded-2xl border-[var(--tk-card)] p-4">
              <div className="rounded-xl bg-background/70 p-4">
                {/* <Android className="w-full" /> */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {" "}
                  {[
                    {
                      name: "You",
                      amount: "+1.18",
                      color: "text-green-400",
                    },
                    {
                      name: "Alice",
                      amount: "+0.08",
                      color: "text-green-400",
                    },
                    { name: "Bob", amount: "-1.26", color: "text-red-400" },
                  ].map((member) => (
                    <div
                      key={member.name}
                      className="glass-morphism rounded-xl p-4 text-center"
                    >
                      <p className="text-sm lg:text-base text-gray-400">
                        {member.name}
                      </p>
                      <p
                        className={`text-2xl lg:text-5xl font-bold ${member.color}`}
                      >
                        {" "}
                        {member.amount}{" "}
                      </p>
                      <p className="text-xs lg:text-base text-gray-500">ETH</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs text-muted-foreground">
                    5 expenses logged
                  </span>
                  <button className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
                    Settle Now
                  </button>
                </div>
              </div>
            </MagicCard>
          </FloatingElement>
          <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
          {/* <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-purple-500/20 blur-2xl" /> */}
          <SpinningText className="absolute bottom-0 left-0">
            5 Members • 12 Expenses
          </SpinningText>
        </div>
      </div>
    </section>
  );
}
