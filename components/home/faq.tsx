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
              a: "For the demo, we use test tokens on Base Sepolia. For production, you'll need a small amount of ETH for gas fees.",
            },
            {
              q: "How accurate is the AI receipt scanning?",
              a: "Our AI achieves 95%+ accuracy on standard receipts. You can always edit before submitting to the blockchain.",
            },
            {
              q: "What happens if someone disputes an expense?",
              a: "Future versions will include dispute resolution. Currently, all members can view full transaction history for transparency.",
            },
            {
              q: "Is my financial data secure?",
              a: "Receipt images are stored on IPFS with only hashes onchain. No personal financial data is stored on the blockchain.",
            },
            {
              q: "Can I export my expense data?",
              a: "Yes! Export to CSV, PDF, or integrate with your accounting software via our API.",
            },
          ].map((faq, idx) => (
            <motion.details
              key={idx}
              className="group rounded-xl border border-border/60 p-5"
            >
              <summary className="cursor-pointer list-none text-base font-medium">
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
