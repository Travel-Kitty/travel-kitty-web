import React from "react";
import { Check, Play } from "lucide-react";

import { MagicCard } from "../ui/magic-card";
import { AuroraText } from "../ui/aurora-text";

export default function Demo() {
  return (
    <section id="demo" className="px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-7xl">
        <MagicCard className="rounded-2xl border-[var(--tk-card)] p-0">
          <div className="grid items-center gap-8 p-6 md:p-10 lg:grid-cols-2">
            <div className="space-y-5">
              <h2 className="text-3xl sm:text-4xl font-bold">
                See It In <AuroraText>Action</AuroraText>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                Try our live demo with sample data on Base Sepolia testnet. No
                real funds required!
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "3 sample members with test transactions",
                  "5 preloaded expenses to explore",
                  "Full settlement flow demonstration",
                  "View actual blockchain transactions",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 text-green-500" />
                    <span className="text-muted-foreground">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
                  Launch Demo
                </button>
                <button className="rounded-full border border-border/60 bg-background/50 px-6 py-3 text-sm font-semibold hover:bg-muted/60">
                  View on Explorer
                </button>
              </div>
            </div>

            <div className="relative h-64 lg:h-96 overflow-hidden rounded-2xl border border-border/60">
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-14 w-14 text-foreground/40" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="rounded-lg border border-border/60 bg-background/70 p-3 text-sm text-muted-foreground">
                  90 second demo walkthrough
                </div>
              </div>
            </div>
          </div>
        </MagicCard>
      </div>
    </section>
  );
}
