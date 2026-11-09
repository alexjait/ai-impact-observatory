-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'es');

-- CreateEnum
CREATE TYPE "RoleKey" AS ENUM ('REGISTERED', 'MODERATOR', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Granularity" AS ENUM ('tarea', 'funcion', 'rol', 'profesion');

-- CreateEnum
CREATE TYPE "EditorialStatus" AS ENUM ('pending', 'approved', 'rejected', 'needs_correction', 'archived');

-- CreateEnum
CREATE TYPE "ReliabilityFlag" AS ENUM ('normal', 'outdated', 'low_confidence', 'archived');

-- CreateEnum
CREATE TYPE "CommentVisibilityStatus" AS ENUM ('visible', 'hidden', 'archived');

-- CreateEnum
CREATE TYPE "CommentReportStatus" AS ENUM ('clean', 'reported', 'under_review', 'resolved');

-- CreateEnum
CREATE TYPE "SeedImportStatus" AS ENUM ('running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('local', 'google');

-- CreateEnum
CREATE TYPE "AuthFlowPurpose" AS ENUM ('google_oauth', 'social_signup');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "termsAcceptedAt" TIMESTAMP(3),
    "localePreference" "Locale" NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthIdentity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "passwordHash" TEXT,
    "displayNameSnapshot" TEXT,
    "avatarUrl" TEXT,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthFlowState" (
    "id" TEXT NOT NULL,
    "purpose" "AuthFlowPurpose" NOT NULL,
    "provider" "AuthProvider",
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT,
    "authIdentityId" TEXT,
    "returnTo" TEXT,
    "payloadJson" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthFlowState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "key" "RoleKey" NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authIdentityId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authIdentityId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryTranslation" (
    "id" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "IndustryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionalCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FunctionalCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionalCategoryTranslation" (
    "id" TEXT NOT NULL,
    "functionalCategoryId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "FunctionalCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "granularity" "Granularity" NOT NULL,
    "editorialStatus" "EditorialStatus" NOT NULL DEFAULT 'pending',
    "officialAiStatus" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityTranslation" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "editorialSummary" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "slug" TEXT NOT NULL,

    CONSTRAINT "ActivityTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityIndustry" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,

    CONSTRAINT "ActivityIndustry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityCategory" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "functionalCategoryId" TEXT NOT NULL,

    CONSTRAINT "ActivityCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "editorialStatus" "EditorialStatus" NOT NULL DEFAULT 'pending',
    "type" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "eventDate" TIMESTAMP(3),
    "reliabilityFlag" "ReliabilityFlag" NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceTranslation" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "EvidenceTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceActivity" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "EvidenceActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedImportRun" (
    "id" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "status" "SeedImportStatus" NOT NULL DEFAULT 'running',
    "processedRows" INTEGER NOT NULL DEFAULT 0,
    "rejectedRows" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "SeedImportRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedImportItem" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "sourceKey" TEXT,
    "status" "SeedImportStatus" NOT NULL,
    "warning" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeedImportItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_provider_providerUserId_key" ON "AuthIdentity"("provider", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_provider_email_key" ON "AuthIdentity"("provider", "email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthFlowState_tokenHash_key" ON "AuthFlowState"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAssignment_userId_roleId_key" ON "UserRoleAssignment"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_key_key" ON "Industry"("key");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryTranslation_industryId_locale_key" ON "IndustryTranslation"("industryId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryTranslation_locale_slug_key" ON "IndustryTranslation"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionalCategory_key_key" ON "FunctionalCategory"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionalCategoryTranslation_functionalCategoryId_locale_key" ON "FunctionalCategoryTranslation"("functionalCategoryId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionalCategoryTranslation_locale_slug_key" ON "FunctionalCategoryTranslation"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_key_key" ON "Activity"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityTranslation_activityId_locale_key" ON "ActivityTranslation"("activityId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityTranslation_locale_slug_key" ON "ActivityTranslation"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityIndustry_activityId_industryId_key" ON "ActivityIndustry"("activityId", "industryId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityCategory_activityId_functionalCategoryId_key" ON "ActivityCategory"("activityId", "functionalCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceTranslation_evidenceId_locale_key" ON "EvidenceTranslation"("evidenceId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceTranslation_locale_slug_key" ON "EvidenceTranslation"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceActivity_evidenceId_activityId_key" ON "EvidenceActivity"("evidenceId", "activityId");

-- AddForeignKey
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthFlowState" ADD CONSTRAINT "AuthFlowState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthFlowState" ADD CONSTRAINT "AuthFlowState_authIdentityId_fkey" FOREIGN KEY ("authIdentityId") REFERENCES "AuthIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_authIdentityId_fkey" FOREIGN KEY ("authIdentityId") REFERENCES "AuthIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_authIdentityId_fkey" FOREIGN KEY ("authIdentityId") REFERENCES "AuthIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTranslation" ADD CONSTRAINT "IndustryTranslation_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionalCategoryTranslation" ADD CONSTRAINT "FunctionalCategoryTranslation_functionalCategoryId_fkey" FOREIGN KEY ("functionalCategoryId") REFERENCES "FunctionalCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityTranslation" ADD CONSTRAINT "ActivityTranslation_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityIndustry" ADD CONSTRAINT "ActivityIndustry_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityIndustry" ADD CONSTRAINT "ActivityIndustry_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityCategory" ADD CONSTRAINT "ActivityCategory_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityCategory" ADD CONSTRAINT "ActivityCategory_functionalCategoryId_fkey" FOREIGN KEY ("functionalCategoryId") REFERENCES "FunctionalCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceTranslation" ADD CONSTRAINT "EvidenceTranslation_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceActivity" ADD CONSTRAINT "EvidenceActivity_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceActivity" ADD CONSTRAINT "EvidenceActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeedImportItem" ADD CONSTRAINT "SeedImportItem_runId_fkey" FOREIGN KEY ("runId") REFERENCES "SeedImportRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
