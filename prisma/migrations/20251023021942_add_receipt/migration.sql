-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code6" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "tripAddress" TEXT NOT NULL,
    "createTxHash" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripMember" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "payer" TEXT NOT NULL,
    "amountUsd6" INTEGER NOT NULL,
    "cid" TEXT NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "total" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "User"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_code6_key" ON "Trip"("code6");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_tripAddress_key" ON "Trip"("tripAddress");

-- CreateIndex
CREATE INDEX "Trip_creator_idx" ON "Trip"("creator");

-- CreateIndex
CREATE INDEX "Trip_code6_idx" ON "Trip"("code6");

-- CreateIndex
CREATE INDEX "TripMember_wallet_idx" ON "TripMember"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "TripMember_tripId_wallet_key" ON "TripMember"("tripId", "wallet");

-- CreateIndex
CREATE INDEX "Expense_tripId_idx" ON "Expense"("tripId");

-- CreateIndex
CREATE INDEX "Expense_payer_idx" ON "Expense"("payer");

-- CreateIndex
CREATE INDEX "Receipt_tripId_idx" ON "Receipt"("tripId");

-- AddForeignKey
ALTER TABLE "TripMember" ADD CONSTRAINT "TripMember_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripMember" ADD CONSTRAINT "TripMember_wallet_fkey" FOREIGN KEY ("wallet") REFERENCES "User"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
