-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('INTRA_EU', 'EXTRA_EU', 'MIXED');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('MGO', 'MDO', 'HFO', 'LNG', 'METHANOL', 'AMMONIA', 'HYDROGEN', 'BATTERY', 'WIND', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "PoolType" AS ENUM ('VOLUNTARY', 'MANDATORY', 'COMPANY', 'FLEET');

-- CreateEnum
CREATE TYPE "PoolStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalDistanceNauticalMiles" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "RouteStatus" NOT NULL,
    "segments" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ship_compliance" (
    "id" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "reportingPeriod" TEXT NOT NULL,
    "totalEnergyConsumed" DOUBLE PRECISION NOT NULL,
    "totalCO2Emissions" DOUBLE PRECISION NOT NULL,
    "averageCarbonIntensity" DOUBLE PRECISION NOT NULL,
    "targetCarbonIntensity" DOUBLE PRECISION NOT NULL,
    "complianceStatus" "ComplianceStatus" NOT NULL,
    "poolId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "compliancePeriods" JSONB NOT NULL,
    "fuelConsumptions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ship_compliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_entries" (
    "id" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "reportingPeriod" TEXT NOT NULL,
    "bankedAmount" DOUBLE PRECISION NOT NULL,
    "appliedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingAmount" DOUBLE PRECISION NOT NULL,
    "appliedToPeriod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "PoolStatus" NOT NULL DEFAULT 'ACTIVE',
    "complianceRecords" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pool_members" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "vesselIds" TEXT[],
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contributionPercentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "pool_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "routes_startDate_idx" ON "routes"("startDate");

-- CreateIndex
CREATE INDEX "routes_status_idx" ON "routes"("status");

-- CreateIndex
CREATE INDEX "routes_vesselId_idx" ON "routes"("vesselId");

-- CreateIndex
CREATE INDEX "ship_compliance_reportingPeriod_idx" ON "ship_compliance"("reportingPeriod");

-- CreateIndex
CREATE INDEX "ship_compliance_complianceStatus_idx" ON "ship_compliance"("complianceStatus");

-- CreateIndex
CREATE INDEX "ship_compliance_poolId_idx" ON "ship_compliance"("poolId");

-- CreateIndex
CREATE INDEX "ship_compliance_vesselId_idx" ON "ship_compliance"("vesselId");

-- CreateIndex
CREATE UNIQUE INDEX "ship_compliance_vesselId_reportingPeriod_key" ON "ship_compliance"("vesselId", "reportingPeriod");

-- CreateIndex
CREATE INDEX "bank_entries_appliedToPeriod_idx" ON "bank_entries"("appliedToPeriod");

-- CreateIndex
CREATE INDEX "bank_entries_reportingPeriod_idx" ON "bank_entries"("reportingPeriod");

-- CreateIndex
CREATE INDEX "bank_entries_vesselId_idx" ON "bank_entries"("vesselId");

-- CreateIndex
CREATE INDEX "pools_status_idx" ON "pools"("status");

-- CreateIndex
CREATE INDEX "pool_members_poolId_idx" ON "pool_members"("poolId");

-- CreateIndex
CREATE INDEX "pool_members_companyId_idx" ON "pool_members"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "pool_members_poolId_companyId_key" ON "pool_members"("poolId", "companyId");

-- AddForeignKey
ALTER TABLE "ship_compliance" ADD CONSTRAINT "ship_compliance_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_members" ADD CONSTRAINT "pool_members_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
