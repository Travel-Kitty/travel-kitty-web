/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { keccak256, toBytes } from "viem";
import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
  readContract,
} from "wagmi/actions";
import Link from "next/link";
import {
  Loader2,
  Plus,
  LogIn,
  Coins,
  Copy,
  ExternalLink,
  Search,
  Plane,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import {
  ReceiptCreateDialog,
  type ReceiptCreateForm,
} from "@/components/trip/receipt-create-dialog";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuroraText } from "@/components/ui/aurora-text";
import FooterTrip from "@/components/layout/footer-trip";

import { config } from "@/lib/wagmi";
import { cn } from "@/utils/utils";
import Logo from "@/public/images/logo.png";
import { ADDR, factoryAbi, faucetAbi, travelKittyAbi } from "@/lib/contracts";
import {
  useTripList,
  useCreateTrip,
  useJoinTrip,
} from "@/hooks/handler-request/use-trip";

// ---------- small utils ----------
const basescanTx = (hash: string) => `https://sepolia.basescan.org/tx/${hash}`;

const makeCode6 = () =>
  Array.from(
    { length: 6 },
    () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
  ).join("");

function parseWagmiError(e: unknown): string {
  const err = e as any;
  const parts: (string | undefined)[] = [
    err?.shortMessage,
    err?.cause?.reason,
    err?.cause?.shortMessage,
    Array.isArray(err?.cause?.metaMessages)
      ? err.cause.metaMessages.join("\n")
      : undefined,
    Array.isArray(err?.metaMessages) ? err.metaMessages.join("\n") : undefined,
    err?.details,
    err?.message,
  ];
  const msg = parts.find(Boolean);
  return msg ?? "unknown reason";
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const me = useMemo(() => address?.toLowerCase(), [address]);
  const router = useRouter();

  // ----- form states
  const [joinCode, setJoinCode] = useState("");
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"all" | "joined" | "mine">("all");

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  // ----- tx states
  const [creating, setCreating] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  // ----- trips list via TanStack Query
  const {
    data: trips = [],
    isLoading: loadingTrips,
    isError: errorTrips,
    error: tripsError,
  } = useTripList({
    query: debouncedSearch,
    scope,
    me: address,
    enabled: !!isConnected,
  });

  const { data: pendingHash } = useWriteContract();
  useWaitForTransactionReceipt({ hash: pendingHash });

  const createTripMutation = useCreateTrip();
  const joinTripMutation = useJoinTrip();

  function handleRedirectToDetail(id: string) {
    router.push(`/trip/${id}`);
  }

  // ---------- claim faucet with cooldown explanation ----------
  async function handleClaim() {
    if (!address) return;
    setClaiming(true);
    setClaimMsg(null);
    try {
      const sim = await simulateContract(config, {
        address: ADDR.FAUCET,
        abi: faucetAbi,
        functionName: "claim",
        args: [],
        account: address as `0x${string}`,
      });
      const hash = await writeContract(config, sim.request);
      await waitForTransactionReceipt(config, { hash });
      setClaimMsg("✅ Claimed mUSD!");
      toast.success("Successfully claimed mUSD!");
    } catch (e) {
      let msg = parseWagmiError(e);
      if (/COOLDOWN/i.test(msg)) {
        try {
          const [last, cd] = await Promise.all([
            readContract(config, {
              address: ADDR.FAUCET,
              abi: faucetAbi,
              functionName: "lastClaim",
              args: [address as `0x${string}`],
            }) as Promise<bigint>,
            readContract(config, {
              address: ADDR.FAUCET,
              abi: faucetAbi,
              functionName: "cooldown",
            }) as Promise<bigint>,
          ]);
          const next = Number(last + cd) * 1000;
          msg = `⏳ COOLDOWN — try again at ${new Date(next).toLocaleString()}`;
        } catch (e2) {
          console.warn("cooldown detail failed:", e2);
        }
      }
      setClaimMsg(`❌ ${msg}`);
      toast.error(msg);
    } finally {
      setClaiming(false);
    }
  }

  // ---------- join trip by 6-char code ----------
  async function handleJoinByCode() {
    if (!address) return;
    const code = joinCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      toast.error("Enter a valid 6-character code");
      return;
    }
    try {
      const joined = await joinTripMutation.mutateAsync({
        code6: code,
        wallet: me!,
      });
      let tripAddr = (joined as any)?.tripAddress as `0x${string}` | undefined;
      if (!tripAddr && Array.isArray(trips)) {
        const row = trips.find((t) => t.code6 === code);
        tripAddr = row?.tripAddress as `0x${string}` | undefined;
      }
      if (!tripAddr) throw new Error("Unable to resolve trip address...");

      const chainMembers = (await readContract(config, {
        address: tripAddr,
        abi: travelKittyAbi,
        functionName: "getMembers",
      })) as `0x${string}`[];
      const amMember = chainMembers.some(
        (m) => m.toLowerCase() === address.toLowerCase()
      );

      if (!amMember) {
        try {
          const hash = await writeContract(config, {
            address: tripAddr,
            abi: travelKittyAbi,
            functionName: "join",
            account: address as `0x${string}`,
          });
          await waitForTransactionReceipt(config, { hash });
        } catch (err: any) {
          const msg = String(err?.shortMessage ?? err?.message ?? err);
          if (!/already|member/i.test(msg)) throw err;
        }
      }

      setJoinCode("");
      toast.success("✅ Joined trip!");
    } catch (e) {
      const msg = parseWagmiError(e);
      toast.error(msg);
      console.error(e);
    }
  }

  // dialog state
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const handleSubmitCreateDialog = async (values: ReceiptCreateForm) => {
    if (!address) throw new Error("Wallet not connected");
    setCreating(true);
    try {
      const code6 = makeCode6();
      const salt = keccak256(
        toBytes(`${address.toLowerCase()}:${values.name.trim()}:${Date.now()}`)
      );

      const sim = await simulateContract(config, {
        address: ADDR.FACTORY,
        abi: factoryAbi,
        functionName: "createTrip",
        args: [salt],
        account: address as `0x${string}`,
      });

      const hash = await writeContract(config, sim.request);
      await waitForTransactionReceipt(config, { hash });

      const tripAddr = sim.result as `0x${string}`;

      await createTripMutation.mutateAsync({
        name: values.name.trim(),
        code6,
        creator: address.toLowerCase(),
        tripAddress: tripAddr,
        createTxHash: hash,
        chainId: 84532,
        currency: values.currency,
        items: values.items,
        total: values.total,
      });

      try {
        const jHash = await writeContract(config, {
          address: tripAddr,
          abi: travelKittyAbi,
          functionName: "join",
          account: address as `0x${string}`,
        });
        await waitForTransactionReceipt(config, { hash: jHash });
      } catch (err: any) {
        const msg = String(err?.shortMessage ?? err?.message ?? err);
        if (!/already|member/i.test(msg)) throw err;
      }

      try {
        await joinTripMutation.mutateAsync({
          code6,
          wallet: address.toLowerCase(),
        });
      } catch (err) {
        console.warn("DB join for creator failed (non-fatal):", err);
      }

      toast.success(`🐾 Trip created! Code: ${code6}`);
      setOpenCreateDialog(false);
    } finally {
      setCreating(false);
    }
  };

  // ---------- render ----------
  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-background dark:via-background dark:to-primary/5 text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between rounded-b-2xl border border-t-0 border-border/50 bg-background/70 backdrop-blur supports-backdrop-blur:backdrop-blur">
            <div className="flex items-center gap-3 pl-3">
              <Image
                src={Logo}
                alt="Travel Kitty Logo"
                className="h-10 w-10 rounded-xl"
              />
              <span className="font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent text-base sm:text-lg">
                Travel Kitty
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 pr-4">
              <AnimatedThemeToggler className="!cursor-pointer" />
              <div className="hidden sm:block">
                <ConnectButton
                  accountStatus="address"
                  chainStatus="full"
                  showBalance={false}
                />
              </div>
              <div className="sm:hidden">
                <ConnectButton
                  accountStatus="avatar"
                  chainStatus="icon"
                  showBalance={false}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 sm:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 mx-auto">
        {!isConnected ? (
          <Card className="border shadow-sm dark:shadow-none mt-6">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Plane className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  Welcome to Travel Kitty
                </h3>
                <p className="text-neutral-600 dark:text-muted-foreground max-w-md">
                  Connect your wallet to start splitting travel expenses
                  instantly with AI & blockchain technology.
                </p>
              </div>
              <div className="pt-4">
                <ConnectButton />
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8 sm:py-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Split Travel Expenses <AuroraText>Instantly</AuroraText>
              </h2>
              <p className="text-neutral-600 dark:text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                Smart wallet pools for your trips. AI powered receipt scanning,
                automatic currency conversion, and transparent onchain
                settlement.
              </p>
            </div>

            {/* Get Ready Section */}
            <section className="space-y-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {/* Create Trip Card */}
                <Card className="border shadow-sm hover:border-primary/50 transition-colors dark:shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Create New Trip
                    </CardTitle>
                    <CardDescription>
                      Deploy a new onchain kitty via the Factory. You&apos;ll
                      receive a 6 char join code to share with travel
                      companions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => setOpenCreateDialog(true)}
                      disabled={creating || createTripMutation.isPending}
                      className="w-full"
                      size="lg"
                    >
                      {creating || createTripMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Trip
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <ReceiptCreateDialog
                  open={openCreateDialog}
                  onOpenChange={setOpenCreateDialog}
                  onSubmitFinal={handleSubmitCreateDialog}
                />

                {/* Join & Claim Card */}
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Join Trip & Get Funds
                    </CardTitle>
                    <CardDescription>
                      Enter a 6 character code to join an existing trip, or
                      claim test tokens to get started.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Join by code */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Join with code
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={joinCode}
                          onChange={(e) =>
                            setJoinCode(e.target.value.toUpperCase())
                          }
                          placeholder="ABC123"
                          maxLength={6}
                          className="uppercase font-mono"
                        />
                        <Button
                          onClick={handleJoinByCode}
                          disabled={joinTripMutation.isPending}
                          size="lg"
                        >
                          {joinTripMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Join"
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/70" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>
                    </div>

                    {/* Claim faucet */}
                    <div className="space-y-2">
                      <Button
                        onClick={handleClaim}
                        disabled={claiming}
                        variant="default"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:text-foreground"
                        size="lg"
                      >
                        {claiming ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Coins className="mr-2 h-4 w-4" />
                            Claim Test mUSD
                          </>
                        )}
                      </Button>
                      {claimMsg && (
                        <p
                          className={cn(
                            "text-sm text-center",
                            claimMsg.startsWith("✅")
                              ? "text-emerald-500"
                              : "text-destructive"
                          )}
                        >
                          {claimMsg}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Trips Section */}
            <section className="space-y-6">
              <Card className="shadow-sm dark:shadow-none">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    {/* Tabs */}
                    <Tabs
                      value={scope}
                      onValueChange={(v) => setScope(v as any)}
                      className="w-full sm:w-auto"
                    >
                      <TabsList className="grid w-full grid-cols-3 sm:w-auto !cursor-pointer">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="joined">Joined</TabsTrigger>
                        <TabsTrigger value="mine">My Trips</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loadingTrips && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}

                    {!loadingTrips && trips.length === 0 && !errorTrips && (
                      <div className="text-center py-12 space-y-2">
                        <p className="text-neutral-600 dark:text-muted-foreground">
                          No trips match your filter.
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-muted-foreground">
                          Create a new trip or join one with a code to get
                          started.
                        </p>
                      </div>
                    )}

                    {errorTrips && (
                      <div className="text-center py-12">
                        <p className="text-destructive">
                          Failed to load trips:{" "}
                          {(tripsError as Error)?.message ?? "Unknown error"}
                        </p>
                      </div>
                    )}

                    {trips.map((t) => (
                      <Card
                        key={t.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent>
                          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg">
                                  {t.name}
                                </h3>
                                {t.mine && (
                                  <Badge variant="default">Owner</Badge>
                                )}
                                {!t.mine && t.joined && (
                                  <Badge variant="secondary">Joined</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>
                                  {t.mine
                                    ? "You created this trip"
                                    : t.joined
                                    ? "You're a member"
                                    : "Public trip"}
                                </span>
                                <span>·</span>
                                <Link
                                  href={basescanTx(t.createTxHash)}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 hover:text-blue-500 hover:underline transition-colors"
                                >
                                  View transaction
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {t.mine && (
                                <Button
                                  onClick={() => {
                                    navigator.clipboard.writeText(t.code6);
                                    toast.success("Code copied to clipboard!");
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="font-mono">{t.code6}</span>
                                </Button>
                              )}
                              <Button
                                size="sm"
                                disabled={!t.mine && !t.joined}
                                onClick={() => handleRedirectToDetail(t.id)}
                              >
                                Open Trip
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <FooterTrip />
    </div>
  );
}
