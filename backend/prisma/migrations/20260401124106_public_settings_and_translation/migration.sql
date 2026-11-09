-- CreateTable
CREATE TABLE "PortalConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "publicCommentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByUserId" TEXT,

    CONSTRAINT "PortalConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PortalConfig" ADD CONSTRAINT "PortalConfig_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
