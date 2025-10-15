import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import Logo from "@/public/images/logo.png";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between rounded-b-2xl border border-t-0 border-border/50 bg-background/70 backdrop-blur supports-backdrop-blur:backdrop-blur">
          <div className="flex items-center gap-3 pl-3">
            <Image
              src={Logo}
              alt="Travel Kitty Logo"
              className="h-10 w-10 rounded-xl"
            />
            <span className="font-semibold text-base sm:text-lg">
              Travel Kitty
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 pr-4">
            <a
              href="#features"
              className="text-sm hover:text-primary pointer-cursor"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm hover:text-primary pointer-cursor"
            >
              How it Works
            </a>
            <a
              href="#demo"
              className="text-sm hover:text-primary pointer-cursor"
            >
              Demo
            </a>
            <a
              href="#faq"
              className="text-sm hover:text-primary pointer-cursor"
            >
              FAQ
            </a>
            <AnimatedThemeToggler />
            <button className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-105 pointer-cursor">
              Launch App →
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden pr-2">
            <AnimatedThemeToggler />
            <button
              className="p-2"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/90 backdrop-blur">
          <div className="px-4 py-3 space-y-1">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it Works" },
              { href: "#demo", label: "Demo" },
              { href: "#faq", label: "FAQ" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm hover:bg-muted/50"
              >
                {item.label}
              </a>
            ))}
            <button className="mt-2 w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 text-sm font-semibold text-white">
              Launch App →
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
