import React from "react";
import { Check, Play } from "lucide-react";
import { motion, Variants } from "framer-motion";

import { MagicCard } from "../ui/magic-card";
import { AuroraText } from "../ui/aurora-text";

const sectionHeader: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const gridStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const leftColItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const previewVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, filter: "blur(3px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Demo() {
  return (
    <section id="demo" className="px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-7xl">
        <MagicCard className="rounded-2xl border-[var(--tk-card)] p-0">
          <div className="grid items-center gap-8 p-6 md:p-10 lg:grid-cols-2">
            {/* Left column */}
            <motion.div
              className="space-y-5"
              variants={gridStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
            >
              <motion.h2
                className="text-3xl sm:text-4xl font-bold"
                variants={sectionHeader}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35 }}
              >
                See It In <AuroraText>Action</AuroraText>
              </motion.h2>

              <motion.p
                className="text-sm sm:text-base lg:text-lg text-muted-foreground"
                variants={leftColItem}
              >
                Try our live demo with sample data on Base Sepolia testnet. No
                real funds required!
              </motion.p>

              <motion.ul className="space-y-2 text-sm" variants={gridStagger}>
                {[
                  "3 sample members with test transactions",
                  "5 preloaded expenses to explore",
                  "Full settlement flow demonstration",
                  "View actual blockchain transactions",
                ].map((t, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2"
                    variants={listItem}
                  >
                    <Check className="mt-0.5 h-5 w-5 text-green-500" />
                    <span className="text-muted-foreground">{t}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                className="flex flex-col sm:flex-row gap-3"
                variants={leftColItem}
              >
                <button className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
                  Launch Demo
                </button>
                <button className="rounded-full border border-border/60 bg-background/50 px-6 py-3 text-sm font-semibold hover:bg-muted/60">
                  View on Explorer
                </button>
              </motion.div>
            </motion.div>

            {/* Right column: preview box */}
            <motion.div
              className="relative h-64 lg:h-96 overflow-hidden rounded-2xl border border-border/60"
              variants={previewVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-14 w-14 text-foreground/40" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="rounded-lg border border-border/60 bg-background/70 p-3 text-sm text-muted-foreground">
                  90 second demo walkthrough
                </div>
              </div>
            </motion.div>
          </div>
        </MagicCard>
      </div>
    </section>
  );
}
