import React from "react";
import { motion, Variants } from "framer-motion";

import { AuroraText } from "../ui/aurora-text";

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

export default function Faq() {
  return (
    <section id="faq" className="px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="mb-10 text-center"
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Frequently Asked <AuroraText>Questions</AuroraText>
          </h2>
        </motion.div>

        <motion.div
          className="space-y-3"
          variants={listVariants}
          initial="hidden"
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true, amount: 0.25 }}
        >
          {[
            {
              q: "Do I need cryptocurrency to use Travel Kitty?",
              a: "For the demo you’ll connect to Base Sepolia. You’ll need a tiny amount of test ETH for gas and test mUSD (claimable from the in-app faucet).",
            },
            {
              q: "Which chain and tokens are supported in the demo?",
              a: "We run on Base Sepolia. The kitty settles with a test ERC-20 (mUSD). Real-network support will come after the hackathon.",
            },
            {
              q: "How do I join a trip?",
              a: "Enter the 6 character join code in the app. This links you in our database, then the app also calls the smart contract ‘join’ so you become an onchain member. Creators are auto-joined after creating a trip.",
            },
            {
              q: "How accurate is the AI receipt scanning?",
              a: "We use OpenRouter Vision (Qwen2.5-VL) with a tuned prompt. It works well on standard receipts, and you can edit items/amounts before recording onchain.",
            },
            {
              q: "What data is onchain vs off-chain?",
              a: "Members, balances, recorded splits, and settlement live onchain. Receipt text and metadata live in our database; images are stored by URL. No sensitive personal financial data is written to the blockchain.",
            },
            {
              q: "Why do I see COOLDOWN when claiming mUSD?",
              a: "The faucet can be claimed once per cooldown window (e.g., ~24h) per wallet. If you hit COOLDOWN, the app shows when you can try again.",
            },
            {
              q: "How does settlement work?",
              a: "The creator records a split onchain. Debtors then click “Settle Up”—the contract pulls mUSD from the debtor (after approval) and pays creditors, updating balances transparently.",
            },
            {
              q: "Can I export my expense data?",
              a: "Exports (CSV/PDF) are on our near term roadmap. For now you can verify settlements and splits on Basescan from the app.",
            },
          ].map((faq, idx) => (
            <motion.details
              key={idx}
              className="group rounded-xl border border-border/60 p-5 pointer-cursor"
            >
              <summary className="list-none text-base font-medium">
                <span className="mr-2 inline-block rounded-md bg-muted px-2 py-1 text-xs">
                  Q{idx + 1}
                </span>{" "}
                {faq.q}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </motion.details>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
