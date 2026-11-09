-- CreateTable
CREATE TABLE "ActivityFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityFollow_userId_activityId_key" ON "ActivityFollow"("userId", "activityId");

-- CreateIndex
CREATE INDEX "ActivityFollow_userId_createdAt_idx" ON "ActivityFollow"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityFollow_activityId_createdAt_idx" ON "ActivityFollow"("activityId", "createdAt");

-- AddForeignKey
ALTER TABLE "ActivityFollow" ADD CONSTRAINT "ActivityFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityFollow" ADD CONSTRAINT "ActivityFollow_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
