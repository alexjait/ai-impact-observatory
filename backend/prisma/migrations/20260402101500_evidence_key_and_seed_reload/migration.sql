ALTER TABLE "Evidence"
ADD COLUMN "key" TEXT;

CREATE UNIQUE INDEX "Evidence_key_key" ON "Evidence"("key");
