import React from "react";
import { ChevronDown, Code, Layers, Terminal } from "lucide-react";
import { motion, Variants } from "framer-motion";

import { AuroraText } from "../ui/aurora-text";
import { MagicCard } from "../ui/magic-card";
import { Pointer } from "../ui/pointer";

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Architecture() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-10 text-center"
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Technical <AuroraText>Architecture</AuroraText>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Built with modern, scalable technologies
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
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
              <motion.div
                variants={badgeVariants}
                className={`inline-flex rounded-xl bg-gradient-to-r ${arch.color} p-3 text-white`}
              >
                {arch.icon}
              </motion.div>

              <h3 className="mt-3 text-lg sm:text-xl font-semibold">
                {arch.title}
              </h3>

              <motion.ul className="mt-2 space-y-2" variants={gridVariants}>
                {arch.items.map((it, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                    variants={listItem}
                  >
                    <ChevronDown className="mt-0.5 h-4 w-4 rotate-[-90deg] text-muted-foreground" />
                    <span className="text-muted-foreground">{it}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <Pointer>
                <div className="text-2xl">{arch.emoji}</div>
              </Pointer>
            </MagicCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
