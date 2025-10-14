"use client";
import React, { type JSX, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Shield,
  Receipt,
  Layers,
  Play,
  Code,
  Sparkles,
  Terminal,
  Github,
  Globe,
  Users,
  TrendingUp,
  Zap,
  Lock,
  ChevronDown,
  Menu,
  X,
  DollarSign,
  PieChart,
  BarChart3,
  Activity,
} from "lucide-react";
import { ThemeProvider } from "next-themes";
import { Marquee } from "@/components/ui/marquee";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { Pointer } from "@/components/ui/pointer";
import { AuroraText } from "@/components/ui/aurora-text";
import { SpinningText } from "@/components/ui/spinning-text";
import { cn } from "@/lib/utils";

interface CounterProps {
  end: number;
  duration?: number; // ms
  prefix?: string;
  suffix?: string;
}
const Counter: React.FC<CounterProps> = ({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
}) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | undefined;
    const step = (t: number) => {
      if (!startTime) startTime = t;
      const progress = Math.min((t - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return (
    <>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </>
  );
};

const FloatingElement: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => (
  <div className="animate-float" style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

export default function TravelKittyLandingPage(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );
    document
      .querySelectorAll<HTMLElement>("[data-animate]")
      .forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-foreground overflow-x-hidden !cursor-none">
        <SmoothCursor />
        {/* Local keyframes for subtle effects (kept tiny) */}
        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-12px);
            }
          }
          @keyframes gradient-x {
            0%,
            100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 3s ease infinite;
          }
          .glass-morphism {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.08);
          }
          :root {
            --tk-card: 1px solid hsl(var(--border) / 0.6);
          }
        `}</style>

        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between rounded-b-2xl border border-t-0 border-border/50 bg-background/70 backdrop-blur supports-backdrop-blur:backdrop-blur">
              <div className="flex items-center gap-3 pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-sm">
                  TK
                </div>
                <span className="font-semibold text-base sm:text-lg">
                  Travel Kitty
                </span>
              </div>

              <div className="hidden md:flex items-center gap-6 pr-4">
                <a href="#features" className="text-sm hover:text-primary">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm hover:text-primary">
                  How it Works
                </a>
                <a href="#demo" className="text-sm hover:text-primary">
                  Demo
                </a>
                <a href="#faq" className="text-sm hover:text-primary">
                  FAQ
                </a>
                <AnimatedThemeToggler />
                <button className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-105">
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

        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div
              className="space-y-6 animate-slide-up"
              data-animate
              id="hero-copy"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs">
                <Activity className="h-4 w-4 text-green-500" />
                <span>Built on Base Sepolia • Web3 + AI Powered</span>
              </div>

              <h1 className="font-bold leading-tight text-4xl sm:text-5xl lg:text-6xl">
                Split Travel Expenses <AuroraText>Instantly</AuroraText> with AI
                & Blockchain
              </h1>

              <p className="max-w-2xl text-balance text-base sm:text-lg lg:text-xl text-muted-foreground">
                Smart wallet pools for your trips. AI powered receipt scanning,
                automatic currency conversion, and transparent onchain
                settlement you can verify.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm sm:text-base font-semibold text-white transition-transform hover:scale-105">
                  <span>Try Live Demo</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/50 px-6 py-3 text-sm sm:text-base font-semibold hover:bg-muted/60">
                  <Play className="h-5 w-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Next.js", "Base", "AI OCR", "IPFS", "Smart Contracts"].map(
                  (tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-xs"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Device preview using MagicUI Android mock */}
            <div className="relative">
              <FloatingElement>
                <MagicCard className="rounded-2xl border-[var(--tk-card)] p-4">
                  <div className="rounded-xl bg-background/70 p-4">
                    {/* <Android className="w-full" /> */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {" "}
                      {[
                        {
                          name: "You",
                          amount: "+1.18",
                          color: "text-green-400",
                        },
                        {
                          name: "Alice",
                          amount: "+0.08",
                          color: "text-green-400",
                        },
                        { name: "Bob", amount: "-1.26", color: "text-red-400" },
                      ].map((member) => (
                        <div
                          key={member.name}
                          className="glass-morphism rounded-xl p-4 text-center"
                        >
                          <p className="text-sm text-gray-400">{member.name}</p>
                          <p className={`text-2xl font-bold ${member.color}`}>
                            {" "}
                            {member.amount}{" "}
                          </p>
                          <p className="text-xs text-gray-500">ETH</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                      <span className="text-xs text-muted-foreground">
                        5 expenses logged
                      </span>
                      <button className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
                        Settle Now
                      </button>
                    </div>
                  </div>
                </MagicCard>
              </FloatingElement>
              <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
              {/* <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-purple-500/20 blur-2xl" /> */}
              <SpinningText className="absolute bottom-0 left-0">
                5 Members • 12 Expenses
              </SpinningText>
            </div>
          </div>
        </section>

        {/* Stats */}
        {/* <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                {
                  label: "Active Trips",
                  value: 127,
                  icon: (<Users />) as React.ReactNode,
                  suffix: "+",
                },
                {
                  label: "Expenses Tracked",
                  value: 3847,
                  icon: (<Receipt />) as React.ReactNode,
                  suffix: "",
                },
                {
                  label: "Total Volume",
                  value: 48.5,
                  icon: (<DollarSign />) as React.ReactNode,
                  suffix: " ETH",
                },
                {
                  label: "Gas Saved",
                  value: 89,
                  icon: (<TrendingUp />) as React.ReactNode,
                  suffix: "%",
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="text-center"
                  data-animate
                  id={`stat-${idx}`}
                >
                  <div className="mx-auto mb-2 inline-flex rounded-xl border border-border/60 p-3 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {isVisible[`stat-${idx}`] && (
                      <Counter end={stat.value} suffix={stat.suffix} />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Features */}
        <section id="features" className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Why <AuroraText>Travel Kitty</AuroraText>?
              </h2>
              <p className="mx-auto mt-3 max-w-3xl text-balance text-sm sm:text-base lg:text-lg text-muted-foreground">
                Combining AI intelligence with blockchain transparency to solve
                group expense tracking forever.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Sparkles className="h-6 w-6" />,
                  title: "AI-Powered OCR",
                  description:
                    "Snap a photo of any receipt. Our AI extracts amounts, currencies, and items instantly.",
                  color: "from-blue-500 to-cyan-500",
                  emoji: "🤖",
                },
                {
                  icon: <Shield className="h-6 w-6" />,
                  title: "On-Chain Proof",
                  description:
                    "Every transaction is recorded on Base blockchain with verifiable smart contracts.",
                  color: "from-purple-500 to-pink-500",
                  emoji: "🔗",
                },
                {
                  icon: <Globe className="h-6 w-6" />,
                  title: "Multi-Currency",
                  description:
                    "Automatic FX conversion using real-time rates. No more manual calculations.",
                  color: "from-green-500 to-emerald-500",
                  emoji: "🌍",
                },
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "Instant Settlement",
                  description:
                    "One-click net settlement. Everyone gets paid or pays their exact share.",
                  color: "from-yellow-500 to-orange-500",
                  emoji: "⚡",
                },
                {
                  icon: <Lock className="h-6 w-6" />,
                  title: "Privacy First",
                  description:
                    "Receipt images on IPFS, only hashes on-chain. Your data stays private.",
                  color: "from-red-500 to-pink-500",
                  emoji: "🔒",
                },
                {
                  icon: <BarChart3 className="h-6 w-6" />,
                  title: "Real-time Analytics",
                  description:
                    "Track spending patterns, export reports, and visualize expense distribution.",
                  color: "from-indigo-500 to-blue-500",
                  emoji: "📊",
                },
              ].map((feature, idx) => (
                <MagicCard
                  key={idx}
                  className="group rounded-2xl border-[var(--tk-card)] p-6 transition-all hover:shadow-lg custom-cursor"
                  data-animate
                >
                  <div
                    className={`mb-3 inline-flex rounded-xl bg-gradient-to-r ${feature.color} p-3 text-white`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  <Pointer>
                    <div className="text-2xl">{feature.emoji}</div>
                  </Pointer>
                </MagicCard>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
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
                  desc: "Real-time updates show who owes what to whom",
                  icon: <PieChart className="h-6 w-6" />,
                },
                {
                  step: "04",
                  title: "Settle Up",
                  desc: "One-click settlement with on-chain verification",
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

        {/* Demo */}
        <section id="demo" className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-7xl">
            <MagicCard className="rounded-2xl border-[var(--tk-card)] p-0">
              <div className="grid items-center gap-8 p-6 md:p-10 lg:grid-cols-2">
                <div className="space-y-5">
                  <h2 className="text-3xl sm:text-4xl font-bold">
                    See It In <AuroraText>Action</AuroraText>
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                    Try our live demo with sample data on Base Sepolia testnet.
                    No real funds required!
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[
                      "3 sample members with test transactions",
                      "5 pre-loaded expenses to explore",
                      "Full settlement flow demonstration",
                      "View actual blockchain transactions",
                    ].map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 text-green-500" />
                        <span className="text-muted-foreground">{t}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
                      Launch Demo
                    </button>
                    <button className="rounded-full border border-border/60 bg-background/50 px-6 py-3 text-sm font-semibold hover:bg-muted/60">
                      View on Explorer
                    </button>
                  </div>
                </div>

                <div className="relative h-64 lg:h-96 overflow-hidden rounded-2xl border border-border/60">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-14 w-14 text-foreground/40" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="rounded-lg border border-border/60 bg-background/70 p-3 text-sm text-muted-foreground">
                      90 second demo walkthrough
                    </div>
                  </div>
                </div>
              </div>
            </MagicCard>
          </div>
        </section>

        {/* Testimonials — MagicUI Marquee */}
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
                      <img
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
                      <img
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

        {/* Architecture */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Technical <AuroraText>Architecture</AuroraText>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                Built with modern, scalable technologies
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
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
                    "Real-time FX rates API",
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
                    "Event-driven architecture",
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
                  <div
                    className={`inline-flex rounded-xl bg-gradient-to-r ${arch.color} p-3 text-white`}
                  >
                    {arch.icon}
                  </div>
                  <h3 className="mt-3 text-lg sm:text-xl font-semibold">
                    {arch.title}
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {arch.items.map((it, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ChevronDown className="mt-0.5 h-4 w-4 rotate-[-90deg] text-muted-foreground" />
                        <span className="text-muted-foreground">{it}</span>
                      </li>
                    ))}
                  </ul>
                  <Pointer>
                    <div className="text-2xl">{arch.emoji}</div>
                  </Pointer>
                </MagicCard>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Frequently Asked <AuroraText>Questions</AuroraText>
              </h2>
            </div>
            <div className="space-y-3">
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
                  a: "Receipt images are stored on IPFS with only hashes on-chain. No personal financial data is stored on the blockchain.",
                },
                {
                  q: "Can I export my expense data?",
                  a: "Yes! Export to CSV, PDF, or integrate with your accounting software via our API.",
                },
              ].map((faq, idx) => (
                <details
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
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
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

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-10 border-t border-border/60">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 grid gap-6 md:grid-cols-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white">
                    TK
                  </div>
                  <span className="font-semibold">Travel Kitty</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Smart expense splitting for modern travelers.
                </p>
              </div>

              {[
                {
                  title: "Product",
                  links: ["Features", "Pricing", "API Docs"],
                },
                {
                  title: "Resources",
                  links: ["Documentation", "GitHub", "Blog"],
                },
                { title: "Connect", links: ["Twitter", "Discord", "Telegram"] },
              ].map((col, i) => (
                <div key={i} className="space-y-3">
                  <h4 className="font-semibold">{col.title}</h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a
                          href="#"
                          className="hover:text-foreground transition-colors"
                        >
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs sm:text-sm md:flex-row">
              <p className="text-muted-foreground">
                © 2025 Travel Kitty. Built for{" "}
                <a
                  href="https://www.basebatches.xyz/"
                  target="_blank"
                  className="underline hover:text-foreground"
                >
                  Base Batches 002 Hackathon.
                </a>
              </p>
              <div className="flex gap-5 text-muted-foreground">
                <a href="#" className="hover:text-foreground">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-foreground">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-foreground">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
