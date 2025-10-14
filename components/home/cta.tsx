import React from "react";
import { ArrowRight, Github } from "lucide-react";

import { AuroraText } from "../ui/aurora-text";

export default function Cta() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl sm:text-4xl font-bold">
          Ready to Simplify Your <AuroraText>Group Expenses</AuroraText>?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-balance text-sm sm:text-base lg:text-lg text-muted-foreground">
          Join thousands of travelers already using Travel Kitty to split
          expenses fairly and transparently.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
            <span>Start Free Trial</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <a
            href="https://github.com/Travel-Kitty"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/50 px-6 py-3 text-sm font-semibold hover:bg-muted/60"
          >
            <Github className="h-5 w-5" />
            <span>View on GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
}
