ALTER TABLE "ActivityProposal"
ADD COLUMN "materializedActivityId" TEXT;

CREATE UNIQUE INDEX "ActivityProposal_materializedActivityId_key"
ON "ActivityProposal"("materializedActivityId");

ALTER TABLE "ActivityProposal"
ADD CONSTRAINT "ActivityProposal_materializedActivityId_fkey"
FOREIGN KEY ("materializedActivityId") REFERENCES "Activity"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
