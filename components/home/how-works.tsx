import React from "react";
import { Check, PieChart, Receipt, Users } from "lucide-react";
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

const gridVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HowWorks() {
  return (
    <section
      id="how-it-works"
      className="px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-transparent to-muted/20"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-10 text-center"
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            How It <AuroraText>Works</AuroraText>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Four simple steps to expense freedom
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-4"
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {[
            {
              step: "01",
              title: "Create Trip",
              desc: "Start a new trip pool and invite friends with a simple link",
              icon: <Users className="h-6 w-6" />,
            },
            {
              step: "02",
              title: "Add Expenses",
              desc: "Snap receipts, AI extracts data, uploads to blockchain",
              icon: <Receipt className="h-6 w-6" />,
            },
            {
              step: "03",
              title: "Track Balance",
              desc: "Realtime updates show who owes what to whom",
              icon: <PieChart className="h-6 w-6" />,
            },
            {
              step: "04",
              title: "Settle Up",
              desc: "One click settlement with onchain verification",
              icon: <Check className="h-6 w-6" />,
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="relative text-center"
              variants={cardVariants}
            >
              <div className="inline-flex flex-col items-center">
                <motion.span
                  className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-4xl sm:text-5xl font-bold"
                  variants={badgeVariants}
                >
                  {item.step}
                </motion.span>
                <motion.div
                  className="mt-3 rounded-xl border border-border/60 p-4"
                  variants={badgeVariants}
                >
                  {item.icon}
                </motion.div>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mx-auto max-w-[18rem] text-sm text-muted-foreground">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
