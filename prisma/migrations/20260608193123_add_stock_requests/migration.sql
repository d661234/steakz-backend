-- CreateEnum
CREATE TYPE "StockRequestStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'ORDERED', 'FULFILLED');

-- CreateTable
CREATE TABLE "StockRequest" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "requestedBy" TEXT,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'units',
    "notes" TEXT,
    "status" "StockRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
