-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('USER', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('OWNER', 'ADMIN', 'EMPLOYEE');

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorUserId_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_sourceLeadId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "LeadNote" DROP CONSTRAINT "LeadNote_createdById_fkey";

-- DropForeignKey
ALTER TABLE "LeadNote" DROP CONSTRAINT "LeadNote_leadId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_clientId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- DropIndex
DROP INDEX "Client_sourceLeadId_key";

-- DropIndex
DROP INDEX "Role_tenantId_name_key";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN "tenantRole" "TenantRole";

-- Backfill tenantRole from legacy role names before dropping old columns
UPDATE "Role"
SET "tenantRole" = CASE
  WHEN lower("name") = 'owner' THEN 'OWNER'::"TenantRole"
  WHEN lower("name") = 'manager' THEN 'ADMIN'::"TenantRole"
  WHEN lower("name") = 'agent' THEN 'EMPLOYEE'::"TenantRole"
  ELSE 'EMPLOYEE'::"TenantRole"
END
WHERE "tenantRole" IS NULL;

ALTER TABLE "Role" ALTER COLUMN "tenantRole" SET NOT NULL;
ALTER TABLE "Role" DROP COLUMN "isSystem";
ALTER TABLE "Role" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "systemRole" "SystemRole" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Activity_id_tenantId_key" ON "Activity"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_id_tenantId_key" ON "AuditLog"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_id_tenantId_key" ON "Client"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_sourceLeadId_tenantId_key" ON "Client"("sourceLeadId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_id_tenantId_key" ON "Invoice"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_id_tenantId_key" ON "Lead"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadNote_id_tenantId_key" ON "LeadNote"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_id_tenantId_key" ON "Payment"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_id_tenantId_key" ON "RefreshToken"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_tenantRole_key" ON "Role"("tenantId", "tenantRole");

-- CreateIndex
CREATE UNIQUE INDEX "Role_id_tenantId_key" ON "Role"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_id_tenantId_key" ON "Subscription"("id", "tenantId");

-- CreateIndex
CREATE INDEX "User_systemRole_idx" ON "User"("systemRole");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_tenantId_key" ON "User"("id", "tenantId");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_tenantId_fkey" FOREIGN KEY ("roleId", "tenantId") REFERENCES "Role"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_tenantId_fkey" FOREIGN KEY ("userId", "tenantId") REFERENCES "User"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_tenantId_fkey" FOREIGN KEY ("roleId", "tenantId") REFERENCES "Role"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_tenantId_fkey" FOREIGN KEY ("assignedToId", "tenantId") REFERENCES "User"("id", "tenantId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_tenantId_fkey" FOREIGN KEY ("leadId", "tenantId") REFERENCES "Lead"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_createdById_tenantId_fkey" FOREIGN KEY ("createdById", "tenantId") REFERENCES "User"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_sourceLeadId_tenantId_fkey" FOREIGN KEY ("sourceLeadId", "tenantId") REFERENCES "Lead"("id", "tenantId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_clientId_tenantId_fkey" FOREIGN KEY ("clientId", "tenantId") REFERENCES "Client"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_tenantId_fkey" FOREIGN KEY ("clientId", "tenantId") REFERENCES "Client"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_tenantId_fkey" FOREIGN KEY ("subscriptionId", "tenantId") REFERENCES "Subscription"("id", "tenantId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_tenantId_fkey" FOREIGN KEY ("invoiceId", "tenantId") REFERENCES "Invoice"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_tenantId_fkey" FOREIGN KEY ("userId", "tenantId") REFERENCES "User"("id", "tenantId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_tenantId_fkey" FOREIGN KEY ("actorUserId", "tenantId") REFERENCES "User"("id", "tenantId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_tenantId_fkey" FOREIGN KEY ("userId", "tenantId") REFERENCES "User"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
