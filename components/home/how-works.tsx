import React from "react";
import { Check, PieChart, Receipt, Users } from "lucide-react";

import { AuroraText } from "../ui/aurora-text";

export default function HowWorks() {
  return (
    <section
      id="how-it-works"
      className="px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-transparent to-muted/20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">
            How It <AuroraText>Works</AuroraText>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Four simple steps to expense freedom
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
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
            <div key={idx} className="relative text-center">
              <div className="inline-flex flex-col items-center">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-4xl sm:text-5xl font-bold">
                  {item.step}
                </span>
                <div className="mt-3 rounded-xl border border-border/60 p-4">
                  {item.icon}
                </div>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mx-auto max-w-[18rem] text-sm text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
