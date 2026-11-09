-- CreateTable
CREATE TABLE "ActivityProposal" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "granularity" "Granularity" NOT NULL,
    "editorialStatus" "EditorialStatus" NOT NULL DEFAULT 'pending',
    "moderationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityProposalTranslation" (
    "id" TEXT NOT NULL,
    "activityProposalId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT,
    "fullDescription" TEXT,

    CONSTRAINT "ActivityProposalTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityProposalIndustry" (
    "id" TEXT NOT NULL,
    "activityProposalId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,

    CONSTRAINT "ActivityProposalIndustry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityProposalCategory" (
    "id" TEXT NOT NULL,
    "activityProposalId" TEXT NOT NULL,
    "functionalCategoryId" TEXT NOT NULL,

    CONSTRAINT "ActivityProposalCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceProposal" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "eventDate" TIMESTAMP(3),
    "editorialStatus" "EditorialStatus" NOT NULL DEFAULT 'pending',
    "moderationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceProposalTranslation" (
    "id" TEXT NOT NULL,
    "evidenceProposalId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "context" TEXT NOT NULL,

    CONSTRAINT "EvidenceProposalTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceProposalActivity" (
    "id" TEXT NOT NULL,
    "evidenceProposalId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "EvidenceProposalActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "activityId" TEXT,
    "evidenceId" TEXT,
    "parentCommentId" TEXT,
    "text" TEXT NOT NULL,
    "visibilityStatus" "CommentVisibilityStatus" NOT NULL DEFAULT 'visible',
    "reportStatus" "CommentReportStatus" NOT NULL DEFAULT 'clean',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReport" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityProposalTranslation_activityProposalId_locale_key" ON "ActivityProposalTranslation"("activityProposalId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityProposalIndustry_activityProposalId_industryId_key" ON "ActivityProposalIndustry"("activityProposalId", "industryId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityProposalCategory_activityProposalId_functionalCateg_key" ON "ActivityProposalCategory"("activityProposalId", "functionalCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceProposalTranslation_evidenceProposalId_locale_key" ON "EvidenceProposalTranslation"("evidenceProposalId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceProposalActivity_evidenceProposalId_activityId_key" ON "EvidenceProposalActivity"("evidenceProposalId", "activityId");

-- CreateIndex
CREATE INDEX "Comment_activityId_visibilityStatus_createdAt_idx" ON "Comment"("activityId", "visibilityStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_evidenceId_visibilityStatus_createdAt_idx" ON "Comment"("evidenceId", "visibilityStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_parentCommentId_visibilityStatus_createdAt_idx" ON "Comment"("parentCommentId", "visibilityStatus", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReport_commentId_reporterUserId_key" ON "CommentReport"("commentId", "reporterUserId");

-- AddForeignKey
ALTER TABLE "ActivityProposal" ADD CONSTRAINT "ActivityProposal_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityProposalTranslation" ADD CONSTRAINT "ActivityProposalTranslation_activityProposalId_fkey" FOREIGN KEY ("activityProposalId") REFERENCES "ActivityProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityProposalIndustry" ADD CONSTRAINT "ActivityProposalIndustry_activityProposalId_fkey" FOREIGN KEY ("activityProposalId") REFERENCES "ActivityProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityProposalIndustry" ADD CONSTRAINT "ActivityProposalIndustry_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityProposalCategory" ADD CONSTRAINT "ActivityProposalCategory_activityProposalId_fkey" FOREIGN KEY ("activityProposalId") REFERENCES "ActivityProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityProposalCategory" ADD CONSTRAINT "ActivityProposalCategory_functionalCategoryId_fkey" FOREIGN KEY ("functionalCategoryId") REFERENCES "FunctionalCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceProposal" ADD CONSTRAINT "EvidenceProposal_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceProposalTranslation" ADD CONSTRAINT "EvidenceProposalTranslation_evidenceProposalId_fkey" FOREIGN KEY ("evidenceProposalId") REFERENCES "EvidenceProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceProposalActivity" ADD CONSTRAINT "EvidenceProposalActivity_evidenceProposalId_fkey" FOREIGN KEY ("evidenceProposalId") REFERENCES "EvidenceProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceProposalActivity" ADD CONSTRAINT "EvidenceProposalActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReport" ADD CONSTRAINT "CommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReport" ADD CONSTRAINT "CommentReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
