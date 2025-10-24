/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { stringToHex } from "viem";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Receipt,
  Loader2,
  ImageIcon,
  Copy,
  CheckCircle2,
} from "lucide-react";
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "wagmi/actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import FooterTrip from "@/components/layout/footer-trip";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

import {
  useTripDetail,
  useTripDbMembers,
} from "@/hooks/handler-request/use-trip";
import { useOnchainMembers } from "@/hooks/handler-request/use-onchain";
import { fmt } from "@/utils/utils";
import { travelKittyAbi, erc20Abi, ADDR } from "@/lib/contracts";
import { config } from "@/lib/wagmi";

export default function TripPage() {
  const params = useParams<{ id: string }>();
  const [settling, setSettling] = useState<boolean>(false);
  const [myBalance, setMyBalance] = useState<bigint | null>(null);
  const { address } = useAccount();

  const { data: trip, isLoading: loadingTrip } = useTripDetail(params.id);
  const { data: dbMembers = [], isLoading: loadingDbMembers } =
    useTripDbMembers(params.id);
  const { data: chainMembers = [], isLoading: loadingChainMembers } =
    useOnchainMembers((trip?.tripAddress as `0x${string}`) || null);

  const amCreator = !!trip && address?.toLowerCase() === trip.creator;
  const members = chainMembers as string[];
  const me = (address ?? "").toLowerCase();
  const onchainJoined = useMemo(
    () => (chainMembers || []).some((m) => m.toLowerCase() === me),
    [chainMembers, me]
  );

  const receiptItems: Array<{
    name?: string;
    qty?: number;
    price?: number;
    unitPrice?: number;
  }> = (trip?.latestReceipt?.items as any[]) || [];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  async function handleExecuteSplit() {
    try {
      if (!amCreator)
        return toast.error("Only the creator can execute the split.");
      if (!trip.latestReceipt) return toast.error("No receipt found.");

      const membersOnchain = (await readContract(config, {
        address: trip.tripAddress as `0x${string}`,
        abi: travelKittyAbi,
        functionName: "getMembers",
      })) as `0x${string}`[];

      if (!membersOnchain || membersOnchain.length < 2) {
        return toast.error("Need at least 2 on-chain members to split.");
      }
      if (
        !membersOnchain.some(
          (m) => m.toLowerCase() === trip.creator.toLowerCase()
        )
      ) {
        return toast.error("Creator has not joined on-chain yet.");
      }

      const total = Number(trip.latestReceipt.total ?? 0);
      const amountUsd6 = BigInt(Math.round(total * 1_000_000));

      const cidBytes = stringToHex(
        JSON.stringify({
          tripId: trip.id,
          total,
          currency: trip.latestReceipt.currency,
          ts: Date.now(),
        })
      );

      const hash = await writeContract(config, {
        address: trip.tripAddress as `0x${string}`,
        abi: travelKittyAbi,
        functionName: "addExpense",
        args: [amountUsd6, cidBytes, membersOnchain],
        account: address as `0x${string}`,
      });

      await waitForTransactionReceipt(config, { hash });
      toast.success("✅ Split recorded on-chain!");
    } catch (e) {
      toast.error(String((e as any).shortMessage ?? (e as any).message ?? e));
      console.error(e);
    }
  }

  async function handleSettleUp() {
    try {
      setSettling(true);
      if (!address) return toast.error("Connect your wallet");
      if (!onchainJoined)
        return toast.error("Please join the trip on-chain first.");

      // 1) My balance
      const myBal = (await readContract(config, {
        address: trip?.tripAddress as `0x${string}`,
        abi: travelKittyAbi,
        functionName: "getBalance",
        args: [address as `0x${string}`],
      })) as bigint;

      if (myBal >= 0n) {
        return toast.error("You have no debt to settle."); // you're a creditor or zero
      }

      // 2) Find a creditor (any member with positive balance)
      const members = (await readContract(config, {
        address: trip?.tripAddress as `0x${string}`,
        abi: travelKittyAbi,
        functionName: "getMembers",
      })) as `0x${string}`[];

      let creditor: `0x${string}` | null = null;
      let credAmt: bigint = 0n;
      for (const m of members) {
        const b = (await readContract(config, {
          address: trip?.tripAddress as `0x${string}`,
          abi: travelKittyAbi,
          functionName: "getBalance",
          args: [m],
        })) as bigint;
        if (b > credAmt) {
          creditor = m;
          credAmt = b;
        }
      }
      if (!creditor || credAmt <= 0n) {
        return toast.error("No creditor found to settle with.");
      }

      // 3) Amount to pay = min(|myBal|, creditor)
      const pay = -myBal < credAmt ? -myBal : credAmt;

      // 4) Approve mUSD
      const approveHash = await writeContract(config, {
        address: ADDR.MOCK_USD,
        abi: erc20Abi,
        functionName: "approve",
        args: [trip?.tripAddress as `0x${string}`, pay],
        account: address as `0x${string}`,
      });
      await waitForTransactionReceipt(config, { hash: approveHash });

      // 5) Settle
      const settleHash = await writeContract(config, {
        address: trip?.tripAddress as `0x${string}`,
        abi: travelKittyAbi,
        functionName: "settleToken",
        args: [creditor, pay, ADDR.MOCK_USD],
        account: address as `0x${string}`,
      });
      await waitForTransactionReceipt(config, { hash: settleHash });

      toast.success("✅ Settled!");
    } catch (e) {
      toast.error(String((e as any).shortMessage ?? (e as any).message ?? e));
      console.error(e);
    } finally {
      setSettling(false);
    }
  }

  useEffect(() => {
    (async () => {
      if (!trip?.tripAddress || !address) return;
      try {
        const b = (await readContract(config, {
          address: trip.tripAddress as `0x${string}`,
          abi: travelKittyAbi,
          functionName: "getBalance",
          args: [address as `0x${string}`],
        })) as bigint;
        setMyBalance(b);
      } catch (e) {
        console.warn("read my balance failed", e);
        setMyBalance(null);
      }
    })();
  }, [trip?.tripAddress, address]);

  if (loadingTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-background dark:via-background dark:to-primary/5">
        <div className="container px-4 sm:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-background dark:via-background dark:to-primary/5">
        <div className="container px-4 sm:px-8 py-8">
          <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <p className="text-gray-600 dark:text-muted-foreground">
                Trip not found
              </p>
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-background dark:via-background dark:to-primary/5 text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between rounded-b-2xl border border-t-0 border-border/50 bg-background/70 backdrop-blur supports-backdrop-blur:backdrop-blur">
            <div className="flex items-center gap-3 pl-1 sm:pl-3 min-w-0">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/trip">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="truncate text-base sm:text-lg font-bold">
                {trip.name}
              </h1>
              {amCreator && <Badge className="shrink-0">Owner</Badge>}
            </div>

            <div className="pr-3">
              <AnimatedThemeToggler className="!cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 sm:px-8 pt-20 sm:pt-24 pb-8 space-y-6 mx-auto">
        {/* Trip Info Card */}
        <Card className="border shadow-sm hover:border-primary/50 transition-colors dark:shadow-none">
          <CardHeader>
            <CardTitle>Trip Information</CardTitle>
            <CardDescription>
              Smart contract details and trip metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Contract Address
                </p>
                <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                  {trip.tripAddress}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(trip.tripAddress, "Address")}
                className="self-start sm:self-center"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Created by</span>
              <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                {trip.creator.slice(0, 6)}...{trip.creator.slice(-4)}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Summary */}
        {trip.latestReceipt && (
          <Card className="border shadow-sm hover:border-primary/50 transition-colors dark:shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Receipt className="h-5 w-5" />
                    Receipt Summary
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Latest expense details
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {trip.latestReceipt.currency}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image preview */}
              {trip.latestReceipt.imageUrl && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-background">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <ImageIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Receipt Image
                    </span>
                  </div>
                  <div className="p-4">
                    <img
                      src={trip.latestReceipt.imageUrl}
                      alt="receipt"
                      className="max-h-64 w-full rounded-md object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Items table */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 bg-muted">
                        <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">
                          Item
                        </th>
                        <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">
                          Qty
                        </th>
                        <th className="p-3 text-right font-medium text-gray-700 dark:text-gray-300">
                          Unit Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {receiptItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-6 text-center text-gray-500 dark:text-gray-400"
                          >
                            No items found
                          </td>
                        </tr>
                      ) : (
                        receiptItems.map((it, i) => (
                          <tr
                            key={i}
                            className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                          >
                            <td className="p-3 text-gray-900 dark:text-white">
                              {it?.name ?? "-"}
                            </td>
                            <td className="p-3 text-gray-700 dark:text-gray-300">
                              {it?.qty ?? 1}
                            </td>
                            <td className="p-3 text-right font-mono text-gray-900 dark:text-white">
                              {fmt(
                                Number(
                                  (it as any).unitPrice ??
                                    (it as any).price ??
                                    0
                                )
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end pt-2">
                <div className="space-y-1 text-right bg-muted px-4 py-3 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total ({trip.latestReceipt.currency})
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {fmt(Number(trip.latestReceipt.total ?? 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border shadow-sm hover:border-primary/50 transition-colors dark:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="h-5 w-5" />
              Trip Members
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              People who have joined this trip
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDbMembers || loadingChainMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {chainMembers.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-gray-600 dark:text-muted-foreground">
                        No members yet
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Share the trip code for others to join
                      </p>
                    </div>
                  ) : (
                    chainMembers.map((m, idx) => (
                      <div
                        key={m}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                            {idx + 1}
                          </div>
                          <code className="text-xs sm:text-sm font-mono text-gray-900 dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">
                            {m}
                          </code>
                        </div>
                        {m.toLowerCase() === trip.creator.toLowerCase() && (
                          <Badge
                            variant="secondary"
                            className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shrink-0"
                          >
                            Creator
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 p-4 rounded-lg bg-muted">
                  {" "}
                  <div className="flex gap-2">
                    {" "}
                    <CheckCircle2 className="h-5 w-5 text-gray-600 dark:text-gray-300 flex-shrink-0 mt-0.5" />{" "}
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      When everyone has joined, you can proceed to recording
                      expenses and settlement.
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {!onchainJoined && !!address && (
          <div className="p-3 rounded-lg bg-muted text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>
                You are not a member on-chain yet. Please join before settling.
              </span>
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    const hash = await writeContract(config, {
                      address: trip.tripAddress as `0x${string}`,
                      abi: travelKittyAbi,
                      functionName: "join",
                      account: address as `0x${string}`,
                    });
                    await waitForTransactionReceipt(config, { hash });
                    toast.success("Joined on-chain!");
                  } catch (e: any) {
                    toast.error(String(e?.shortMessage ?? e?.message ?? e));
                  }
                }}
              >
                Join Trip (on-chain)
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {myBalance !== null && (
          <div className="p-3 rounded-lg bg-muted text-sm">
            {myBalance < 0n ? (
              <span>
                You owe <b>{Number(-myBalance) / 1_000_000} mUSD</b>. Click{" "}
                <b>Settle Up</b> to pay.
              </span>
            ) : myBalance > 0n ? (
              <span>
                You’re owed <b>{Number(myBalance) / 1_000_000} mUSD</b>. Wait
                for members to settle.
              </span>
            ) : (
              <span>Your balance is settled.</span>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* <Button
            className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
            disabled
          >
            Add Expense
          </Button> */}
          {amCreator && (
            <Button
              className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
              onClick={handleExecuteSplit}
            >
              Execute Split (onchain)
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1 border-gray-200 dark:border-gray-800"
            onClick={handleSettleUp}
            disabled={
              settling || !address || !onchainJoined || members.length < 2
            }
          >
            {settling ? (
              <>
                {" "}
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Settling…{" "}
              </>
            ) : (
              "Settle Up"
            )}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <FooterTrip />
    </div>
  );
}
