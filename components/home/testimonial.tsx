import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

import { AuroraText } from "../ui/aurora-text";
import { Marquee } from "../ui/marquee";

import { cn } from "@/utils/utils";

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const TESTIMONIALS = [
  {
    name: "Raka Pradipta",
    username: "@raka.trips",
    body: "Receipts scanned in seconds review, submit, done.",
    img: "https://avatar.vercel.sh/raka",
  },
  {
    name: "Aulia Putri",
    username: "@auliarmdnii",
    body: "Every settlement links to a Base tx fully verifiable.",
    img: "https://avatar.vercel.sh/aulia",
  },
  {
    name: "Kevin Lim",
    username: "@kevinlim",
    body: "Multi currency just works no manual FX math.",
    img: "https://avatar.vercel.sh/kevin",
  },
  {
    name: "Dewi Kartika",
    username: "@dewik",
    body: "IPFS images, onchain hashes privacy with auditability.",
    img: "https://avatar.vercel.sh/dewi",
  },
  {
    name: "Arif Nugroho",
    username: "@arif.ng",
    body: "Net settlement shows exactly who pays what.",
    img: "https://avatar.vercel.sh/arif",
  },
  {
    name: "Sinta Wardana",
    username: "@sintawr",
    body: "Base Sepolia demo made onboarding effortless.",
    img: "https://avatar.vercel.sh/sinta",
  },
  {
    name: "Bagus Mahendra",
    username: "@bagus.m",
    body: "Fast UI realtime updates while logging batches.",
    img: "https://avatar.vercel.sh/bagus",
  },
  {
    name: "Yuki Tan",
    username: "@yukitan",
    body: "Oneclick CSV export keeps reimbursements tidy.",
    img: "https://avatar.vercel.sh/yuki",
  },
  {
    name: "Nadia Putri",
    username: "@nadia.putri",
    body: "Onchain trail ends disputes before they start.",
    img: "https://avatar.vercel.sh/nadia",
  },
];

export default function Testimonial() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-8 text-center"
          variants={headerVariants}
          initial="hidden"
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            What travelers <AuroraText>say</AuroraText>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Real feedback from people who split smarter with Travel Kitty
          </p>
        </motion.div>
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="[--duration:25s]">
            {TESTIMONIALS.map((t, i) => (
              <figure
                key={i}
                className={cn(
                  "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
                  // light styles
                  "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                  // dark styles
                  "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
                )}
              >
                <div className="flex flex-row items-center gap-2">
                  <Image
                    className="rounded-full"
                    width="32"
                    height="32"
                    alt=""
                    src={t.img}
                  />
                  <div className="flex flex-col">
                    <figcaption className="text-sm font-medium dark:text-white">
                      {t.name}
                    </figcaption>
                    <p className="text-xs font-medium dark:text-white/40">
                      {t.username}
                    </p>
                  </div>
                </div>
                <blockquote className="mt-2 text-sm">{t.body}</blockquote>
              </figure>
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:23s]">
            {TESTIMONIALS.map((t, i) => (
              <figure
                key={i}
                className={cn(
                  "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
                  // light styles
                  "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                  // dark styles
                  "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
                )}
              >
                <div className="flex flex-row items-center gap-2">
                  <Image
                    className="rounded-full"
                    width="32"
                    height="32"
                    alt=""
                    src={t.img}
                  />
                  <div className="flex flex-col">
                    <figcaption className="text-sm font-medium dark:text-white">
                      {t.name}
                    </figcaption>
                    <p className="text-xs font-medium dark:text-white/40">
                      {t.username}
                    </p>
                  </div>
                </div>
                <blockquote className="mt-2 text-sm">{t.body}</blockquote>
              </figure>
            ))}
          </Marquee>
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
        </div>
      </div>
    </section>
  );
}
