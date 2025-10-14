import React from "react";
import Image from "next/image";

import { AuroraText } from "../ui/aurora-text";
import { Marquee } from "../ui/marquee";

import { cn } from "@/lib/utils";

export default function Testimonial() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">
            What travelers <AuroraText>say</AuroraText>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Real feedback from people who split smarter with Travel Kitty
          </p>
        </div>
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="[--duration:25s]">
            {[
              {
                name: "Jack",
                username: "@jack",
                body: "I've never seen anything like this before. It's amazing. I love it.",
                img: "https://avatar.vercel.sh/jack",
              },
              {
                name: "Jill",
                username: "@jill",
                body: "I don't know what to say. I'm speechless. This is amazing.",
                img: "https://avatar.vercel.sh/jill",
              },
              {
                name: "John",
                username: "@john",
                body: "I'm at a loss for words. This is amazing. I love it.",
                img: "https://avatar.vercel.sh/john",
              },
              {
                name: "Jane",
                username: "@jane",
                body: "I'm at a loss for words. This is amazing. I love it.",
                img: "https://avatar.vercel.sh/jane",
              },
              {
                name: "Jenny",
                username: "@jenny",
                body: "I'm at a loss for words. This is amazing. I love it.",
                img: "https://avatar.vercel.sh/jenny",
              },
              {
                name: "James",
                username: "@james",
                body: "I'm at a loss for words. This is amazing. I love it.",
                img: "https://avatar.vercel.sh/james",
              },
            ].map((t, i) => (
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
            {[
              {
                name: "Jack",
                username: "@jack",
                body: "I've never seen anything like this before. It's amazing. I love it.",
                img: "https://avatar.vercel.sh/jack",
              },
              {
                name: "Jill",
                username: "@jill",
                body: "I don't know what to say. I'm speechless. This is amazing.",
                img: "https://avatar.vercel.sh/jill",
              },
              {
                name: "John",
                username: "@john",
                body: "I'm at a loss for words. This is amazing. I love it.",
                img: "https://avatar.vercel.sh/john",
              },
              {
                name: "Jane",
                username: "@jane",
                body: "I'm at a loss for words. This is amazing. I love it.",
                img: "https://avatar.vercel.sh/jane",
              },
              {
                name: "Jenny",
                username: "@jenny",
                body: "I'm at a loss for words. This is amazing. I love it.",
                img: "https://avatar.vercel.sh/jenny",
              },
              {
                name: "James",
                username: "@james",
                body: "I'm at a loss for words. This is amazing. I love it.",
                img: "https://avatar.vercel.sh/james",
              },
            ].map((t, i) => (
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
