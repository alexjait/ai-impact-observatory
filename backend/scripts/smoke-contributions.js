const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const {
  PrismaClient,
  EditorialStatus,
  Granularity,
  Locale,
  RoleKey,
} = require('@prisma/client');

const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const prisma = new PrismaClient();
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
const baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/v1`;
const outputDir = path.resolve(__dirname, '..', '..', 'output', 'testing');

function extractCookie(headers) {
  const setCookies =
    typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [];

  const sessionCookie = setCookies.find((cookie) =>
    cookie.startsWith(`${process.env.SESSION_COOKIE_NAME || 'aiio_session'}=`),
  );

  return sessionCookie ? sessionCookie.split(';')[0] : null;
}

async function expectOkJson(response, context) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${context} failed with ${response.status}: ${text}`);
  }

  return data;
}

async function ensureOutputDir() {
  await fs.promises.mkdir(outputDir, { recursive: true });
}

async function registerUser(email, password, displayName) {
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      displayName,
      termsAccepted: true,
    }),
  });

  const body = await expectOkJson(response, `register ${email}`);
  const cookie = extractCookie(response.headers);

  if (!cookie) {
    throw new Error(`register ${email} did not return a session cookie`);
  }

  return { body, cookie };
}

async function assignRoles(userId, roleKeys) {
  const roles = await prisma.role.findMany({
    where: {
      key: {
        in: roleKeys,
      },
    },
  });

  for (const role of roles) {
    await prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId,
        roleId: role.id,
      },
    });
  }
}

async function ensureFixtureTaxonomies() {
  let industry = await prisma.industry.findUnique({
    where: { key: 'smoke-industry' },
  });

  if (!industry) {
    industry = await prisma.industry.create({
      data: {
        key: 'smoke-industry',
        translations: {
          create: [
            { locale: Locale.en, name: 'Smoke Industry', slug: 'smoke-industry' },
            { locale: Locale.es, name: 'Industria Smoke', slug: 'industria-smoke' },
          ],
        },
      },
    });
  }

  let category = await prisma.functionalCategory.findUnique({
    where: { key: 'smoke-category' },
  });

  if (!category) {
    category = await prisma.functionalCategory.create({
      data: {
        key: 'smoke-category',
        translations: {
          create: [
            { locale: Locale.en, name: 'Smoke Category', slug: 'smoke-category' },
            { locale: Locale.es, name: 'Categoria Smoke', slug: 'categoria-smoke' },
          ],
        },
      },
    });
  }

  return { industry, category };
}

async function ensureFixtureActivity(industryId, categoryId) {
  const existing = await prisma.activity.findUnique({
    where: { key: 'smoke-activity' },
  });

  if (existing) {
    return existing;
  }

  return prisma.activity.create({
    data: {
      key: 'smoke-activity',
      granularity: Granularity.tarea,
      editorialStatus: EditorialStatus.approved,
      officialAiStatus: 2,
      translations: {
        create: [
          {
            locale: Locale.en,
            title: 'Smoke Activity',
            shortDescription: 'Smoke activity short description',
            fullDescription: 'Smoke activity full description',
            editorialSummary: 'Smoke activity editorial summary',
            slug: 'smoke-activity',
          },
          {
            locale: Locale.es,
            title: 'Actividad Smoke',
            shortDescription: 'Descripcion corta smoke',
            fullDescription: 'Descripcion completa smoke',
            editorialSummary: 'Resumen editorial smoke',
            slug: 'actividad-smoke',
          },
        ],
      },
      industries: {
        create: [{ industryId }],
      },
      categories: {
        create: [{ functionalCategoryId: categoryId }],
      },
    },
  });
}

async function ensureFixtureEvidence(activityId) {
  const existing = await prisma.evidence.findFirst({
    where: {
      translations: {
        some: {
          locale: Locale.en,
          slug: 'smoke-evidence',
        },
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.evidence.create({
    data: {
      editorialStatus: EditorialStatus.approved,
      type: 'case_study',
      sourceText: 'Smoke source',
      sourceUrl: 'https://example.com/smoke-evidence',
      translations: {
        create: [
          {
            locale: Locale.en,
            title: 'Smoke Evidence',
            summary: 'Smoke evidence summary',
            context: 'Smoke evidence context',
            slug: 'smoke-evidence',
          },
          {
            locale: Locale.es,
            title: 'Evidencia Smoke',
            summary: 'Resumen de evidencia smoke',
            context: 'Contexto de evidencia smoke',
            slug: 'evidencia-smoke',
          },
        ],
      },
      activities: {
        create: [{ activityId }],
      },
    },
  });
}

async function main() {
  await ensureOutputDir();
  const runId = Date.now();
  const startedAt = new Date().toISOString();
  const password = 'SmokeTest123!';
  const firstUser = await registerUser(
    `smoke.contrib.${runId}@example.test`,
    password,
    `Smoke Contrib ${runId}`,
  );
  const secondUser = await registerUser(
    `smoke.contrib.reporter.${runId}@example.test`,
    password,
    `Smoke Reporter ${runId}`,
  );
  await assignRoles(secondUser.body.user.id, [RoleKey.MODERATOR]);

  const { industry, category } = await ensureFixtureTaxonomies();
  const activity = await ensureFixtureActivity(industry.id, category.id);
  const evidence = await ensureFixtureEvidence(activity.id);

  const activityProposalResponse = await fetch(`${baseUrl}/me/activity-proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: firstUser.cookie,
    },
    body: JSON.stringify({
      granularity: 'tarea',
      industryKeys: ['smoke-industry'],
      categoryKeys: ['smoke-category'],
      translations: {
        es: {
          title: `Actividad propuesta ${runId}`,
          shortDescription: 'Resumen ES',
          fullDescription: 'Descripcion completa ES',
        },
        en: {
          title: `Proposed activity ${runId}`,
          shortDescription: 'EN summary',
          fullDescription: 'EN full description',
        },
      },
    }),
  });
  const activityProposal = await expectOkJson(activityProposalResponse, 'create activity proposal');

  const activityProposalListResponse = await fetch(`${baseUrl}/me/activity-proposals?locale=en`, {
    headers: { Cookie: firstUser.cookie },
  });
  const activityProposalList = await expectOkJson(activityProposalListResponse, 'list activity proposals');
  if (!Array.isArray(activityProposalList) || !activityProposalList.find((item) => item.id === activityProposal.id)) {
    throw new Error('Activity proposal list does not include the created proposal.');
  }

  const activityProposalDetailResponse = await fetch(`${baseUrl}/me/activity-proposals/${activityProposal.id}`, {
    headers: { Cookie: firstUser.cookie },
  });
  const activityProposalDetail = await expectOkJson(activityProposalDetailResponse, 'get activity proposal detail');
  if (!Array.isArray(activityProposalDetail.industryKeys) || !activityProposalDetail.industryKeys.includes('smoke-industry')) {
    throw new Error('Activity proposal detail does not expose industry keys.');
  }
  if (activityProposalDetail.translations?.en?.title !== `Proposed activity ${runId}`) {
    throw new Error('Activity proposal detail does not expose bilingual translations.');
  }

  const updateActivityProposalResponse = await fetch(`${baseUrl}/me/activity-proposals/${activityProposal.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: firstUser.cookie,
    },
    body: JSON.stringify({
      granularity: 'funcion',
      industryKeys: ['smoke-industry'],
      categoryKeys: ['smoke-category'],
      translations: {
        es: {
          title: `Actividad ajustada ${runId}`,
          shortDescription: 'Resumen ES ajustado',
          fullDescription: 'Descripcion completa ES ajustada',
        },
        en: {
          title: `Adjusted activity ${runId}`,
          shortDescription: 'Adjusted EN summary',
          fullDescription: 'Adjusted EN description',
        },
      },
    }),
  });
  await expectOkJson(updateActivityProposalResponse, 'update activity proposal');

  const persistedActivityProposal = await prisma.activityProposal.findUnique({
    where: { id: activityProposal.id },
    include: {
      translations: true,
    },
  });
  if (persistedActivityProposal?.granularity !== Granularity.funcion) {
    throw new Error('Persisted activity proposal granularity was not updated.');
  }
  const persistedActivityTranslation = persistedActivityProposal?.translations.find(
    (item) => item.locale === Locale.en,
  );
  if (!persistedActivityTranslation || !persistedActivityTranslation.title.includes('Adjusted activity')) {
    throw new Error('Persisted activity proposal translation was not updated.');
  }

  const evidenceProposalResponse = await fetch(`${baseUrl}/me/evidence-proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: firstUser.cookie,
    },
    body: JSON.stringify({
      type: 'news_article',
      sourceText: 'Smoke contribution source',
      sourceUrl: 'https://example.com/contribution-source',
      eventDate: '2026-03-01',
      activityKeys: ['smoke-activity'],
      translations: {
        es: {
          title: `Evidencia propuesta ${runId}`,
          summary: 'Resumen evidencia ES',
          context: 'Contexto evidencia ES',
        },
        en: {
          title: `Proposed evidence ${runId}`,
          summary: 'Evidence EN summary',
          context: 'Evidence EN context',
        },
      },
    }),
  });
  const evidenceProposal = await expectOkJson(evidenceProposalResponse, 'create evidence proposal');

  const evidenceProposalListResponse = await fetch(`${baseUrl}/me/evidence-proposals?locale=en`, {
    headers: { Cookie: firstUser.cookie },
  });
  const evidenceProposalList = await expectOkJson(evidenceProposalListResponse, 'list evidence proposals');
  if (!Array.isArray(evidenceProposalList) || !evidenceProposalList.find((item) => item.id === evidenceProposal.id)) {
    throw new Error('Evidence proposal list does not include the created proposal.');
  }

  const evidenceProposalDetailResponse = await fetch(`${baseUrl}/me/evidence-proposals/${evidenceProposal.id}`, {
    headers: { Cookie: firstUser.cookie },
  });
  const evidenceProposalDetail = await expectOkJson(evidenceProposalDetailResponse, 'get evidence proposal detail');
  if (!Array.isArray(evidenceProposalDetail.activityKeys) || !evidenceProposalDetail.activityKeys.includes('smoke-activity')) {
    throw new Error('Evidence proposal detail does not expose activity keys.');
  }
  if (evidenceProposalDetail.translations?.en?.title !== `Proposed evidence ${runId}`) {
    throw new Error('Evidence proposal detail does not expose bilingual translations.');
  }

  const moderationActivityDetailResponse = await fetch(
    `${baseUrl}/moderation/activities/${activityProposal.id}?locale=en`,
    {
      headers: { Cookie: secondUser.cookie },
    },
  );
  const moderationActivityDetail = await expectOkJson(
    moderationActivityDetailResponse,
    'get moderation activity proposal detail',
  );
  if (moderationActivityDetail.author?.email !== firstUser.body.user.email) {
    throw new Error('Moderation activity proposal detail does not expose proposal author.');
  }
  if (
    !Array.isArray(moderationActivityDetail.industryKeys) ||
    !moderationActivityDetail.industryKeys.includes('smoke-industry')
  ) {
    throw new Error('Moderation activity proposal detail does not expose industry keys.');
  }

  const approveActivityProposalResponse = await fetch(
    `${baseUrl}/moderation/activities/${activityProposal.id}/approve`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: secondUser.cookie,
      },
      body: JSON.stringify({
        reason: 'Smoke approval for public materialization',
      }),
    },
  );
  await expectOkJson(approveActivityProposalResponse, 'approve activity proposal');

  const approvedActivityProposal = await prisma.activityProposal.findUnique({
    where: { id: activityProposal.id },
    include: {
      materializedActivity: {
        include: {
          translations: true,
        },
      },
    },
  });
  if (!approvedActivityProposal?.materializedActivityId || !approvedActivityProposal.materializedActivity) {
    throw new Error('Approved activity proposal was not materialized into a public activity.');
  }
  if (approvedActivityProposal.materializedActivity.editorialStatus !== EditorialStatus.approved) {
    throw new Error('Materialized activity is not publicly approved.');
  }
  if (
    !approvedActivityProposal.materializedActivity.translations.find(
      (item) => item.locale === Locale.en && item.title.includes('Adjusted activity'),
    )
  ) {
    throw new Error('Materialized activity does not preserve the approved proposal translations.');
  }

  const publicSearchResponse = await fetch(
    `${baseUrl}/public/search?locale=en&q=${encodeURIComponent(`Adjusted activity ${runId}`)}&page=1&pageSize=20`,
  );
  const publicSearch = await expectOkJson(publicSearchResponse, 'search materialized approved activity');
  if (!Array.isArray(publicSearch.items) || !publicSearch.items.find((item) => item.id === approvedActivityProposal.materializedActivityId)) {
    throw new Error('Materialized approved activity is missing from the public activity search.');
  }

  const moderationEvidenceDetailResponse = await fetch(
    `${baseUrl}/moderation/evidence/${evidenceProposal.id}?locale=en`,
    {
      headers: { Cookie: secondUser.cookie },
    },
  );
  const moderationEvidenceDetail = await expectOkJson(
    moderationEvidenceDetailResponse,
    'get moderation evidence proposal detail',
  );
  if (!Array.isArray(moderationEvidenceDetail.activityKeys) || !moderationEvidenceDetail.activityKeys.includes('smoke-activity')) {
    throw new Error('Moderation evidence proposal detail does not expose activity keys.');
  }
  if (moderationEvidenceDetail.sourceUrl !== 'https://example.com/contribution-source') {
    throw new Error('Moderation evidence proposal detail does not expose source URL.');
  }

  const updateEvidenceProposalResponse = await fetch(`${baseUrl}/me/evidence-proposals/${evidenceProposal.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: firstUser.cookie,
    },
    body: JSON.stringify({
      type: 'case_study',
      sourceText: 'Updated smoke contribution source',
      sourceUrl: 'https://example.com/contribution-source-updated',
      eventDate: '2026-03-02',
      activityKeys: ['smoke-activity'],
      translations: {
        es: {
          title: `Evidencia ajustada ${runId}`,
          summary: 'Resumen ajustado ES',
          context: 'Contexto ajustado ES',
        },
        en: {
          title: `Adjusted evidence ${runId}`,
          summary: 'Adjusted EN summary',
          context: 'Adjusted EN context',
        },
      },
    }),
  });
  await expectOkJson(updateEvidenceProposalResponse, 'update evidence proposal');

  const persistedEvidenceProposal = await prisma.evidenceProposal.findUnique({
    where: { id: evidenceProposal.id },
    include: {
      translations: true,
    },
  });
  if (persistedEvidenceProposal?.type !== 'case_study') {
    throw new Error('Persisted evidence proposal type was not updated.');
  }
  const persistedEvidenceTranslation = persistedEvidenceProposal?.translations.find(
    (item) => item.locale === Locale.en,
  );
  if (!persistedEvidenceTranslation || !persistedEvidenceTranslation.title.includes('Adjusted evidence')) {
    throw new Error('Persisted evidence proposal translation was not updated.');
  }

  const moderationActivityQueueResponse = await fetch(
    `${baseUrl}/moderation/queue?type=activity_proposals&page=1&pageSize=10&q=${encodeURIComponent(
      `Adjusted activity ${runId}`,
    )}`,
    {
      headers: { Cookie: secondUser.cookie },
    },
  );
  const moderationActivityQueue = await expectOkJson(
    moderationActivityQueueResponse,
    'filter moderation activity proposal queue',
  );
  if (!moderationActivityQueue.items.find((item) => item.id === activityProposal.id)) {
    throw new Error('Moderation activity proposal search did not return the adjusted proposal.');
  }

  const moderationEvidenceQueueResponse = await fetch(
    `${baseUrl}/moderation/queue?type=evidence_proposals&page=1&pageSize=10&q=${encodeURIComponent(
      `Adjusted evidence ${runId}`,
    )}`,
    {
      headers: { Cookie: secondUser.cookie },
    },
  );
  const moderationEvidenceQueue = await expectOkJson(
    moderationEvidenceQueueResponse,
    'filter moderation evidence proposal queue',
  );
  if (!moderationEvidenceQueue.items.find((item) => item.id === evidenceProposal.id)) {
    throw new Error('Moderation evidence proposal search did not return the adjusted proposal.');
  }

  const approveEvidenceProposalResponse = await fetch(
    `${baseUrl}/moderation/evidence/${evidenceProposal.id}/approve`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: secondUser.cookie,
      },
      body: JSON.stringify({
        reason: 'Smoke approval for public evidence materialization',
      }),
    },
  );
  await expectOkJson(approveEvidenceProposalResponse, 'approve evidence proposal');

  const approvedEvidenceProposal = await prisma.evidenceProposal.findUnique({
    where: { id: evidenceProposal.id },
    include: {
      materializedEvidence: {
        include: {
          translations: true,
          activities: true,
        },
      },
    },
  });
  if (!approvedEvidenceProposal?.materializedEvidenceId || !approvedEvidenceProposal.materializedEvidence) {
    throw new Error('Approved evidence proposal was not materialized into public evidence.');
  }
  if (approvedEvidenceProposal.materializedEvidence.editorialStatus !== EditorialStatus.approved) {
    throw new Error('Materialized evidence is not publicly approved.');
  }
  if (
    !approvedEvidenceProposal.materializedEvidence.translations.find(
      (item) => item.locale === Locale.en && item.title.includes('Adjusted evidence'),
    )
  ) {
    throw new Error('Materialized evidence does not preserve the approved proposal translations.');
  }
  if (
    !approvedEvidenceProposal.materializedEvidence.activities.find(
      (item) => item.activityId === activity.id,
    )
  ) {
    throw new Error('Materialized evidence did not keep its linked public activity.');
  }

  const activityCommentResponse = await fetch(`${baseUrl}/activities/${activity.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: firstUser.cookie,
    },
    body: JSON.stringify({
      text: `Top level activity comment ${runId}`,
    }),
  });
  const activityComment = await expectOkJson(activityCommentResponse, 'create activity comment');

  const replyResponse = await fetch(`${baseUrl}/activities/${activity.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: secondUser.cookie,
    },
    body: JSON.stringify({
      text: `Reply comment ${runId}`,
      parentCommentId: activityComment.id,
    }),
  });
  await expectOkJson(replyResponse, 'create activity reply');

  const evidenceCommentResponse = await fetch(`${baseUrl}/evidence/${evidence.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: firstUser.cookie,
    },
    body: JSON.stringify({
      text: `Evidence comment ${runId}`,
    }),
  });
  await expectOkJson(evidenceCommentResponse, 'create evidence comment');

  const reportResponse = await fetch(`${baseUrl}/comments/${activityComment.id}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: secondUser.cookie,
    },
    body: JSON.stringify({
      reason: 'spam',
      details: 'Smoke report details',
    }),
  });
  const reportBody = await expectOkJson(reportResponse, 'report comment');
  if (!reportBody || reportBody.accepted !== true) {
    throw new Error('Comment report did not return accepted=true.');
  }

  const persistedComment = await prisma.comment.findUnique({
    where: { id: activityComment.id },
    include: {
      reports: true,
      replies: true,
    },
  });
  if (!persistedComment || persistedComment.reportStatus !== 'reported') {
    throw new Error('Reported activity comment did not persist report status.');
  }
  if (!persistedComment.reports.find((report) => report.reason === 'spam')) {
    throw new Error('Comment report record was not persisted.');
  }
  if (!persistedComment.replies.length) {
    throw new Error('Reply was not persisted on the activity comment.');
  }

  const moderationCommentQueueResponse = await fetch(
    `${baseUrl}/moderation/queue?type=comments&page=1&pageSize=10&q=${encodeURIComponent(
      activity.key,
    )}`,
    {
      headers: { Cookie: secondUser.cookie },
    },
  );
  const moderationCommentQueue = await expectOkJson(
    moderationCommentQueueResponse,
    'filter moderation comment queue by related activity',
  );
  const moderatedComment = moderationCommentQueue.items.find(
    (item) => item.id === activityComment.id,
  );
  if (!moderatedComment) {
    throw new Error('Moderation comment search did not return the reported comment by activity key.');
  }
  if (moderatedComment.target?.activity?.key !== activity.key) {
    throw new Error('Moderation comment queue does not expose related activity key.');
  }
  if (!moderatedComment.target?.activity?.title) {
    throw new Error('Moderation comment queue does not expose related activity title.');
  }

  const publicActivityResponse = await fetch(`${baseUrl}/public/activities/smoke-activity?locale=en`);
  const publicActivity = await expectOkJson(publicActivityResponse, 'public activity detail');
  if (publicActivity.publicFeatures?.commentsEnabled) {
    if (!Array.isArray(publicActivity.comments) || publicActivity.comments.length === 0) {
      throw new Error('Public activity detail does not expose comments.');
    }
    const publicActivityComment = publicActivity.comments.find((comment) => comment.id === activityComment.id);
    if (!publicActivityComment) {
      throw new Error('Public activity detail does not expose the created top level comment.');
    }
    if (!Array.isArray(publicActivityComment.replies) || publicActivityComment.replies.length === 0) {
      throw new Error('Public activity detail does not expose replies for the created comment.');
    }
  }

  const publicEvidenceResponse = await fetch(`${baseUrl}/public/evidence/smoke-evidence?locale=en`);
  const publicEvidence = await expectOkJson(publicEvidenceResponse, 'public evidence detail');
  if (publicEvidence.publicFeatures?.commentsEnabled) {
    if (!Array.isArray(publicEvidence.comments) || publicEvidence.comments.length === 0) {
      throw new Error('Public evidence detail does not expose comments.');
    }
    const publicEvidenceComment = publicEvidence.comments.find((comment) =>
      String(comment.text || '').includes(`Evidence comment ${runId}`),
    );
    if (!publicEvidenceComment) {
      throw new Error('Public evidence detail does not expose the created evidence comment.');
    }
  }

  const reportPath = path.join(outputDir, `smoke-contributions-${runId}.json`);
  await fs.promises.writeFile(
    reportPath,
    `${JSON.stringify(
      {
        runId,
        startedAt,
        finishedAt: new Date().toISOString(),
        apiBaseUrl: baseUrl,
        users: {
          contributorEmail: firstUser.body.user.email,
          reporterEmail: secondUser.body.user.email,
        },
        fixtures: {
          activityId: activity.id,
          activitySlug: 'smoke-activity',
          evidenceId: evidence.id,
          evidenceSlug: 'smoke-evidence',
        },
        proposals: {
          activityProposalId: activityProposal.id,
          evidenceProposalId: evidenceProposal.id,
        },
        comments: {
          activityCommentId: activityComment.id,
          evidenceCommentId:
            publicEvidence.publicFeatures?.commentsEnabled === true
              ? publicEvidence.comments.find((comment) =>
                  String(comment.text || '').includes(`Evidence comment ${runId}`),
                )?.id ?? null
              : null,
          reportAccepted: reportBody.accepted === true,
          moderationTargetActivityKey: moderatedComment.target?.activity?.key ?? null,
        },
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log('Smoke contributions passed end to end.');
  console.log(`Execution report: ${reportPath}`);
}

main()
  .catch(async (error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
