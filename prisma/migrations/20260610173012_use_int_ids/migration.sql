/*
  Warnings:

  - The primary key for the `Branch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Branch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `InventoryAlert` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `InventoryAlert` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `MenuItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `MenuItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `propagated_allergies` on the `Order` table. All the data in the column will be lost.
  - The `id` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `customer_id` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `OrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `RoleChangeAudit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `RoleChangeAudit` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `StockRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `StockRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `requestedBy` column on the `StockRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `allergies` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `branch_id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `_UserFavourites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `branch_id` on the `InventoryAlert` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `menuItemId` on the `InventoryAlert` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branch_id` on the `MenuItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branch_id` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `menuItemId` on the `OrderItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `OrderItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `RoleChangeAudit` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `changedBy` on the `RoleChangeAudit` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branch_id` on the `StockRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_UserFavourites` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_UserFavourites` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "InventoryAlert" DROP CONSTRAINT "InventoryAlert_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "RoleChangeAudit" DROP CONSTRAINT "RoleChangeAudit_userId_fkey";

-- DropForeignKey
ALTER TABLE "StockRequest" DROP CONSTRAINT "StockRequest_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "StockRequest" DROP CONSTRAINT "StockRequest_requestedBy_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "_UserFavourites" DROP CONSTRAINT "_UserFavourites_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFavourites" DROP CONSTRAINT "_UserFavourites_B_fkey";

-- AlterTable
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Branch_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "InventoryAlert" DROP CONSTRAINT "InventoryAlert_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "branch_id",
ADD COLUMN     "branch_id" INTEGER NOT NULL,
DROP COLUMN "menuItemId",
ADD COLUMN     "menuItemId" INTEGER NOT NULL,
ADD CONSTRAINT "InventoryAlert_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "branch_id",
ADD COLUMN     "branch_id" INTEGER NOT NULL,
ADD CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
DROP COLUMN "propagated_allergies",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "branch_id",
ADD COLUMN     "branch_id" INTEGER NOT NULL,
DROP COLUMN "customer_id",
ADD COLUMN     "customer_id" INTEGER,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "menuItemId",
ADD COLUMN     "menuItemId" INTEGER NOT NULL,
DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "RoleChangeAudit" DROP CONSTRAINT "RoleChangeAudit_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "changedBy",
ADD COLUMN     "changedBy" INTEGER NOT NULL,
ADD CONSTRAINT "RoleChangeAudit_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "StockRequest" DROP CONSTRAINT "StockRequest_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "branch_id",
ADD COLUMN     "branch_id" INTEGER NOT NULL,
DROP COLUMN "requestedBy",
ADD COLUMN     "requestedBy" INTEGER,
ADD CONSTRAINT "StockRequest_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "allergies",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "branch_id",
ADD COLUMN     "branch_id" INTEGER,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_UserFavourites" DROP CONSTRAINT "_UserFavourites_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_UserFavourites_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateIndex
CREATE INDEX "_UserFavourites_B_index" ON "_UserFavourites"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleChangeAudit" ADD CONSTRAINT "RoleChangeAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFavourites" ADD CONSTRAINT "_UserFavourites_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFavourites" ADD CONSTRAINT "_UserFavourites_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
