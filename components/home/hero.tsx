import React from "react";
import { Activity, ArrowRight, Play } from "lucide-react";
import { motion, Variants } from "framer-motion";

import { AuroraText } from "../ui/aurora-text";
import { MagicCard } from "../ui/magic-card";
import { SpinningText } from "../ui/spinning-text";
import { AnimatedShinyText } from "../ui/animated-shiny-text";
import FloatingElement from "./floating-element";

const container: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ease: [0.22, 1, 0.36, 1],
      duration: 0.5,
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const pill: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 min-h-screen flex flex-col justify-center">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        {/* COPY */}
        <motion.div
          className="space-y-6 animate-slide-up"
          data-animate
          id="hero-copy"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs"
          >
            <Activity className="h-4 w-4 text-green-500" />
            <AnimatedShinyText>
              Built on Base Sepolia • Web3 + AI Powered
            </AnimatedShinyText>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-bold leading-tight text-4xl sm:text-5xl lg:text-6xl"
          >
            Split Travel Expenses <AuroraText>Instantly</AuroraText> with AI &
            Blockchain
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-2xl text-balance text-base sm:text-lg lg:text-xl text-muted-foreground"
          >
            Smart wallet pools for your trips. AI powered receipt scanning,
            automatic currency conversion, and transparent onchain settlement
            you can verify.
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm sm:text-base font-semibold text-white transition-transform hover:scale-105 pointer-cursor">
              <span>Try Live Demo</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/50 px-6 py-3 text-sm sm:text-base font-semibold hover:bg-muted/60 pointer-cursor">
              <Play className="h-5 w-5" />
              <span>Watch Demo</span>
            </button>
          </motion.div>

          <motion.div variants={item} className="flex flex-wrap gap-2">
            {["Next.js", "Base", "AI OCR", "IPFS", "Smart Contracts"].map(
              (tech, i) => (
                <motion.span
                  key={tech}
                  custom={i}
                  variants={pill}
                  className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-xs"
                >
                  {tech}
                </motion.span>
              )
            )}
          </motion.div>
        </motion.div>

        {/* Device preview using MagicUI Android mock */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 28, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <FloatingElement>
            <MagicCard className="rounded-2xl border-[var(--tk-card)] p-4">
              <div className="rounded-xl bg-background/70 p-4">
                {/* <Android className="w-full" /> */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: "You", amount: "+1.18", color: "text-green-400" },
                    { name: "Alice", amount: "+0.08", color: "text-green-400" },
                    { name: "Bob", amount: "-1.26", color: "text-red-400" },
                  ].map((member, i) => (
                    <motion.div
                      key={member.name}
                      className="glass-morphism rounded-xl p-4 text-center"
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.1 + i * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <p className="text-sm lg:text-base text-gray-400">
                        {member.name}
                      </p>
                      <p
                        className={`text-2xl lg:text-5xl font-bold ${member.color}`}
                      >
                        {member.amount}
                      </p>
                      <p className="text-xs lg:text-base text-gray-500">ETH</p>
                    </motion.div>
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
        </motion.div>
      </div>
    </section>
  );
}
