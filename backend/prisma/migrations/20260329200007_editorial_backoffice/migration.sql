-- CreateEnum
CREATE TYPE "ModerationTargetType" AS ENUM ('activity_proposal', 'evidence_proposal', 'comment', 'activity', 'evidence');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('approve', 'reject', 'request_correction', 'hide', 'archive', 'resolve_report', 'mark_reliability', 'update_summary');

-- CreateTable
CREATE TABLE "ModerationAction" (
    "id" TEXT NOT NULL,
    "targetType" "ModerationTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "actionType" "ModerationActionType" NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activityProposalId" TEXT,
    "evidenceProposalId" TEXT,
    "commentId" TEXT,
    "evidenceId" TEXT,

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorialActivityStatusHistory" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "previousOfficialAiStatus" INTEGER,
    "newOfficialAiStatus" INTEGER,
    "previousEditorialStatus" "EditorialStatus",
    "newEditorialStatus" "EditorialStatus",
    "rationale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditorialActivityStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModerationAction_targetType_targetId_createdAt_idx" ON "ModerationAction"("targetType", "targetId", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationAction_actorUserId_createdAt_idx" ON "ModerationAction"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "EditorialActivityStatusHistory_activityId_createdAt_idx" ON "EditorialActivityStatusHistory"("activityId", "createdAt");

-- CreateIndex
CREATE INDEX "EditorialActivityStatusHistory_actorUserId_createdAt_idx" ON "EditorialActivityStatusHistory"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_activityProposalId_fkey" FOREIGN KEY ("activityProposalId") REFERENCES "ActivityProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_evidenceProposalId_fkey" FOREIGN KEY ("evidenceProposalId") REFERENCES "EvidenceProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialActivityStatusHistory" ADD CONSTRAINT "EditorialActivityStatusHistory_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialActivityStatusHistory" ADD CONSTRAINT "EditorialActivityStatusHistory_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
