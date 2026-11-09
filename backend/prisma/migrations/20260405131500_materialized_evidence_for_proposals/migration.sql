ALTER TABLE "EvidenceProposal"
ADD COLUMN "materializedEvidenceId" TEXT;

CREATE UNIQUE INDEX "EvidenceProposal_materializedEvidenceId_key"
ON "EvidenceProposal"("materializedEvidenceId");

ALTER TABLE "EvidenceProposal"
ADD CONSTRAINT "EvidenceProposal_materializedEvidenceId_fkey"
FOREIGN KEY ("materializedEvidenceId") REFERENCES "Evidence"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
