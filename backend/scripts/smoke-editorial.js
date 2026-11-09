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

async function ensureOutputDir() {
  await fs.promises.mkdir(outputDir, { recursive: true });
}

async function expectOkJson(response, context) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${context} failed with ${response.status}: ${text}`);
  }

  return data;
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
    where: { key: 'smoke-editorial-industry' },
  });

  if (!industry) {
    industry = await prisma.industry.create({
      data: {
        key: 'smoke-editorial-industry',
        translations: {
          create: [
            {
              locale: Locale.en,
              name: 'Smoke Editorial Industry',
              slug: 'smoke-editorial-industry',
            },
            {
              locale: Locale.es,
              name: 'Industria Editorial Smoke',
              slug: 'industria-editorial-smoke',
            },
          ],
        },
      },
    });
  }

  let category = await prisma.functionalCategory.findUnique({
    where: { key: 'smoke-editorial-category' },
  });

  if (!category) {
    category = await prisma.functionalCategory.create({
      data: {
        key: 'smoke-editorial-category',
        translations: {
          create: [
            {
              locale: Locale.en,
              name: 'Smoke Editorial Category',
              slug: 'smoke-editorial-category',
            },
            {
              locale: Locale.es,
              name: 'Categoria Editorial Smoke',
              slug: 'categoria-editorial-smoke',
            },
          ],
        },
      },
    });
  }

  return { industry, category };
}

async function createPendingEditorialFixture(
  runId,
  suffix,
  industryId,
  categoryId,
  options = {},
) {
  const withSummaries = options.withSummaries === true;

  return prisma.activity.create({
    data: {
      key: `smoke-editorial-${runId}-${suffix}`,
      granularity: Granularity.tarea,
      editorialStatus: EditorialStatus.pending,
      officialAiStatus: 0,
      translations: {
        create: [
          {
            locale: Locale.en,
            title: `Smoke Editorial ${suffix.toUpperCase()} ${runId}`,
            shortDescription: `Smoke editorial short ${suffix} EN`,
            fullDescription: `Smoke editorial full ${suffix} EN`,
            editorialSummary: withSummaries
              ? `Smoke editorial summary ${suffix} EN ${runId}`
              : suffix === 'a'
                ? null
                : '',
            slug: `smoke-editorial-${runId}-${suffix}`,
          },
          {
            locale: Locale.es,
            title: `Editorial Smoke ${suffix.toUpperCase()} ${runId}`,
            shortDescription: `Smoke editorial short ${suffix} ES`,
            fullDescription: `Smoke editorial full ${suffix} ES`,
            editorialSummary: withSummaries
              ? `Resumen editorial smoke ${suffix} ES ${runId}`
              : suffix === 'a'
                ? null
                : '',
            slug: `editorial-smoke-${runId}-${suffix}`,
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
    include: {
      translations: true,
    },
  });
}

async function createFixtureEvidenceForActivity(runId, activityId) {
  return prisma.evidence.create({
    data: {
      editorialStatus: EditorialStatus.approved,
      type: 'case_study',
      sourceText: `Smoke editorial evidence source ${runId}`,
      sourceUrl: `https://example.com/smoke-editorial-${runId}`,
      translations: {
        create: [
          {
            locale: Locale.en,
            title: `Smoke Editorial Evidence ${runId}`,
            summary: 'Smoke editorial evidence summary EN',
            context: 'Smoke editorial evidence context EN',
            slug: `smoke-editorial-evidence-${runId}`,
          },
          {
            locale: Locale.es,
            title: `Evidencia Editorial Smoke ${runId}`,
            summary: 'Smoke editorial evidence summary ES',
            context: 'Smoke editorial evidence context ES',
            slug: `evidencia-editorial-smoke-${runId}`,
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

  const editorUser = await registerUser(
    `smoke.editor.${runId}@example.test`,
    password,
    `Smoke Editor ${runId}`,
  );
  await assignRoles(editorUser.body.user.id, [RoleKey.EDITOR, RoleKey.MODERATOR]);

  const { industry, category } = await ensureFixtureTaxonomies();
  const activityA = await createPendingEditorialFixture(
    runId,
    'a',
    industry.id,
    category.id,
  );
  const activityB = await createPendingEditorialFixture(
    runId,
    'b',
    industry.id,
    category.id,
  );
  const activityC = await createPendingEditorialFixture(
    runId,
    'c',
    industry.id,
    category.id,
    { withSummaries: true },
  );
  await createFixtureEvidenceForActivity(runId, activityA.id);
  await createFixtureEvidenceForActivity(`${runId}-bulk`, activityC.id);

  const bulkApproveResponse = await fetch(`${baseUrl}/editorial/activities/bulk-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: editorUser.cookie,
    },
    body: JSON.stringify({
      ids: [activityC.id, activityB.id],
      editorialStatus: 'approved',
      officialAiStatus: 4,
      rationale: `Bulk editorial rationale ${runId}`,
    }),
  });
  const bulkApprove = await expectOkJson(
    bulkApproveResponse,
    'bulk approve editorial activities',
  );
  if (bulkApprove.processedCount !== 1 || bulkApprove.skippedCount !== 1) {
    throw new Error('Bulk editorial approval did not report the expected processed/skipped counts.');
  }
  const bulkApprovedItem = bulkApprove.results.find((item) => item.id === activityC.id);
  const bulkSkippedItem = bulkApprove.results.find((item) => item.id === activityB.id);
  if (bulkApprovedItem?.result !== 'updated') {
    throw new Error('Bulk editorial approval did not update the ready activity.');
  }
  if (bulkSkippedItem?.result !== 'skipped') {
    throw new Error('Bulk editorial approval did not skip the incomplete activity.');
  }
  if (!String(bulkSkippedItem?.reason || '').includes('bilingual editorial summaries')) {
    throw new Error('Bulk editorial skip reason did not expose the readiness guardrail.');
  }

  const bulkApprovedDetailResponse = await fetch(
    `${baseUrl}/editorial/activities/${activityC.id}?locale=en&status=approved`,
    {
      headers: {
        Cookie: editorUser.cookie,
      },
    },
  );
  const bulkApprovedDetail = await expectOkJson(
    bulkApprovedDetailResponse,
    'get bulk approved editorial activity detail',
  );
  if (bulkApprovedDetail.editorialStatus !== 'approved' || bulkApprovedDetail.officialAiStatus !== 4) {
    throw new Error('Bulk approved activity did not persist editorial decision.');
  }

  const filteredEditorialResponse = await fetch(
    `${baseUrl}/editorial/activities?status=pending&locale=en&page=1&pageSize=10&q=${encodeURIComponent(
      `Smoke Editorial A ${runId}`,
    )}&hasEvidence=true&hasEditorialSummary=false&industry=smoke-editorial-industry&category=smoke-editorial-category&officialAiStatus=0`,
    {
      headers: {
        Cookie: editorUser.cookie,
      },
    },
  );
  const filteredEditorial = await expectOkJson(
    filteredEditorialResponse,
    'list filtered editorial activities',
  );
  if (!Array.isArray(filteredEditorial.items) || filteredEditorial.items.length !== 1) {
    throw new Error('Filtered editorial queue did not narrow down to the expected fixture.');
  }
  if (filteredEditorial.items[0].id !== activityA.id) {
    throw new Error('Filtered editorial queue returned an unexpected activity.');
  }
  if (!filteredEditorial.items[0].completionSignals?.hasEvidence) {
    throw new Error('Filtered editorial queue item does not expose evidence completion signal.');
  }

  const navigationQueueResponse = await fetch(
    `${baseUrl}/editorial/activities?status=pending&locale=en&page=1&pageSize=2000`,
    {
      headers: {
        Cookie: editorUser.cookie,
      },
    },
  );
  const navigationQueue = await expectOkJson(
    navigationQueueResponse,
    'list editorial navigation queue',
  );
  const fixtureNavigationItems = navigationQueue.items.filter((item) =>
    [activityA.id, activityB.id].includes(item.id),
  );
  if (fixtureNavigationItems.length !== 2) {
    throw new Error('Editorial navigation queue did not return both fixture activities.');
  }

  const editorialQueueResponse = await fetch(
    `${baseUrl}/editorial/activities?status=pending&locale=en&page=1&pageSize=1&q=${encodeURIComponent(
      `Smoke Editorial A ${runId}`,
    )}`,
    {
      headers: {
        Cookie: editorUser.cookie,
      },
    },
  );
  const editorialQueue = await expectOkJson(editorialQueueResponse, 'list editorial activities');
  const targetActivity = editorialQueue.items?.[0];
  if (!targetActivity?.id) {
    throw new Error('Editorial queue did not return a pending activity to review.');
  }

  const detailBeforeResponse = await fetch(
    `${baseUrl}/editorial/activities/${targetActivity.id}?locale=en&status=pending`,
    {
      headers: {
        Cookie: editorUser.cookie,
      },
    },
  );
  const detailBefore = await expectOkJson(detailBeforeResponse, 'get editorial activity detail before update');
  const sortedNavigationIds = navigationQueue.items.map((item) => item.id);
  const targetIndex = sortedNavigationIds.indexOf(targetActivity.id);
  const expectedPreviousId =
    targetIndex > 0 ? sortedNavigationIds[targetIndex - 1] : null;
  const expectedNextId =
    targetIndex >= 0 && targetIndex < sortedNavigationIds.length - 1
      ? sortedNavigationIds[targetIndex + 1]
      : null;
  if (detailBefore.reviewNavigation?.laneStatus !== 'pending') {
    throw new Error('Editorial detail did not expose the requested review lane.');
  }
  if (detailBefore.reviewNavigation?.previousId !== expectedPreviousId) {
    throw new Error('Editorial detail previousId does not match pending lane ordering.');
  }
  if (detailBefore.reviewNavigation?.nextId !== expectedNextId) {
    throw new Error('Editorial detail nextId does not match pending lane ordering.');
  }
  if (!detailBefore.completionSignals || detailBefore.completionSignals.hasEvidence !== true) {
    throw new Error('Editorial detail does not expose completion signals.');
  }

  const summaryEn = `Smoke editorial summary EN ${runId}`;
  const summaryEs = `Resumen editorial smoke ES ${runId}`;

  const updateSummaryResponse = await fetch(
    `${baseUrl}/editorial/activities/${targetActivity.id}/summary`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: editorUser.cookie,
      },
      body: JSON.stringify({
        translations: {
          en: { editorialSummary: summaryEn },
          es: { editorialSummary: summaryEs },
        },
      }),
    },
  );
  await expectOkJson(updateSummaryResponse, 'update editorial summary');

  const updateStatusResponse = await fetch(
    `${baseUrl}/editorial/activities/${targetActivity.id}/status`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: editorUser.cookie,
      },
      body: JSON.stringify({
        officialAiStatus: 2,
        rationale: `Smoke editorial rationale ${runId}`,
        editorialStatus: 'approved',
      }),
    },
  );
  await expectOkJson(updateStatusResponse, 'update editorial activity status');

  const detailAfterResponse = await fetch(
    `${baseUrl}/editorial/activities/${targetActivity.id}?locale=en&status=approved`,
    {
      headers: {
        Cookie: editorUser.cookie,
      },
    },
  );
  const detailAfter = await expectOkJson(detailAfterResponse, 'get editorial activity detail after update');
  if (detailAfter.editorialStatus !== 'approved') {
    throw new Error('Editorial activity did not move to approved.');
  }
  if (detailAfter.officialAiStatus !== 2) {
    throw new Error('Editorial activity did not persist the official AI status.');
  }
  if (detailAfter.translations?.en?.editorialSummary !== summaryEn) {
    throw new Error('Editorial summary EN was not persisted.');
  }
  if (detailAfter.reviewNavigation?.laneStatus !== 'approved') {
    throw new Error('Editorial detail did not switch review navigation to approved lane.');
  }

  const approvedSummaryFilterResponse = await fetch(
    `${baseUrl}/editorial/activities?status=approved&locale=en&page=1&pageSize=10&q=${encodeURIComponent(
      `Smoke Editorial A ${runId}`,
    )}&hasEditorialSummary=true`,
    {
      headers: {
        Cookie: editorUser.cookie,
      },
    },
  );
  const approvedSummaryFilter = await expectOkJson(
    approvedSummaryFilterResponse,
    'list approved editorial activities with summary',
  );
  if (!approvedSummaryFilter.items.find((item) => item.id === targetActivity.id)) {
    throw new Error('Approved editorial summary filter did not return the updated activity.');
  }

  const publicActivityResponse = await fetch(
    `${baseUrl}/public/activities/${detailAfter.translations.en.slug}?locale=en`,
  );
  const publicActivity = await expectOkJson(publicActivityResponse, 'public activity after editorial approval');
  if (publicActivity.editorialSummary !== summaryEn) {
    throw new Error('Public activity did not expose the editorial summary after approval.');
  }

  const commenterUser = await registerUser(
    `smoke.editor.commenter.${runId}@example.test`,
    password,
    `Smoke Commenter ${runId}`,
  );
  const reporterUser = await registerUser(
    `smoke.editor.reporter.${runId}@example.test`,
    password,
    `Smoke Reporter ${runId}`,
  );

  const commentResponse = await fetch(`${baseUrl}/activities/${targetActivity.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: commenterUser.cookie,
    },
    body: JSON.stringify({
      text: `Smoke editorial comment ${runId}`,
    }),
  });
  const comment = await expectOkJson(commentResponse, 'create comment on editorially approved activity');

  const reportResponse = await fetch(`${baseUrl}/comments/${comment.id}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: reporterUser.cookie,
    },
    body: JSON.stringify({
      reason: 'spam',
      details: 'Smoke editorial moderation report',
    }),
  });
  await expectOkJson(reportResponse, 'report editorial smoke comment');

  const moderationQueueResponse = await fetch(
    `${baseUrl}/moderation/queue?type=comments&page=1&pageSize=20`,
    {
      headers: {
        Cookie: editorUser.cookie,
      },
    },
  );
  const moderationQueue = await expectOkJson(moderationQueueResponse, 'get moderation comment queue');
  if (!Array.isArray(moderationQueue.items) || !moderationQueue.items.find((item) => item.id === comment.id)) {
    throw new Error('Moderation queue did not include the reported comment.');
  }

  const hideCommentResponse = await fetch(`${baseUrl}/moderation/comments/${comment.id}/hide`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: editorUser.cookie,
    },
    body: JSON.stringify({
      reason: 'Smoke moderation hide',
    }),
  });
  await expectOkJson(hideCommentResponse, 'hide reported comment');

  const publicActivityAfterModerationResponse = await fetch(
    `${baseUrl}/public/activities/${detailAfter.translations.en.slug}?locale=en`,
  );
  const publicActivityAfterModeration = await expectOkJson(
    publicActivityAfterModerationResponse,
    'public activity after comment moderation',
  );
  if (publicActivityAfterModeration.comments.find((item) => item.id === comment.id)) {
    throw new Error('Hidden comment is still visible in public activity detail.');
  }

  const reportPath = path.join(outputDir, `smoke-editorial-${runId}.json`);
  await fs.promises.writeFile(
    reportPath,
    `${JSON.stringify(
      {
        runId,
        startedAt,
        finishedAt: new Date().toISOString(),
        reviewedActivityId: targetActivity.id,
        reviewedActivityKey: detailAfter.key,
        publicSlug: detailAfter.translations.en.slug,
        siblingPendingActivityId: activityB.id,
        bulkApprovedActivityId: activityC.id,
        summaryEn,
        summaryEs,
        commentId: comment.id,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log('Smoke editorial passed end to end.');
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
