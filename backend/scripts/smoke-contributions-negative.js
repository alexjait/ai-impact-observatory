const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { PrismaClient, EditorialStatus, Granularity, Locale } = require('@prisma/client');

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

async function expectStatus(response, expectedStatus, context) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (response.status !== expectedStatus) {
    throw new Error(
      `${context} expected ${expectedStatus} but received ${response.status}: ${text}`,
    );
  }

  return data;
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
    where: { key: 'smoke-activity-negative' },
  });

  if (existing) {
    return existing;
  }

  return prisma.activity.create({
    data: {
      key: 'smoke-activity-negative',
      granularity: Granularity.tarea,
      editorialStatus: EditorialStatus.approved,
      officialAiStatus: 1,
      translations: {
        create: [
          {
            locale: Locale.en,
            title: 'Smoke Activity Negative',
            shortDescription: 'Negative smoke activity',
            fullDescription: 'Negative smoke activity full description',
            editorialSummary: 'Negative smoke editorial summary',
            slug: 'smoke-activity-negative',
          },
          {
            locale: Locale.es,
            title: 'Actividad Smoke Negativa',
            shortDescription: 'Actividad smoke negativa',
            fullDescription: 'Actividad smoke negativa completa',
            editorialSummary: 'Resumen editorial smoke negativo',
            slug: 'actividad-smoke-negativa',
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
          slug: 'smoke-evidence-negative',
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
      sourceText: 'Smoke negative source',
      sourceUrl: 'https://example.com/smoke-evidence-negative',
      translations: {
        create: [
          {
            locale: Locale.en,
            title: 'Smoke Evidence Negative',
            summary: 'Smoke evidence negative summary',
            context: 'Smoke evidence negative context',
            slug: 'smoke-evidence-negative',
          },
          {
            locale: Locale.es,
            title: 'Evidencia Smoke Negativa',
            summary: 'Resumen evidencia smoke negativa',
            context: 'Contexto evidencia smoke negativa',
            slug: 'evidencia-smoke-negativa',
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
  const password = 'SmokeNegative123!';
  const author = await registerUser(
    `smoke.contrib.negative.author.${runId}@example.test`,
    password,
    `Negative Author ${runId}`,
  );
  const secondUser = await registerUser(
    `smoke.contrib.negative.second.${runId}@example.test`,
    password,
    `Negative Second ${runId}`,
  );

  const { industry, category } = await ensureFixtureTaxonomies();
  const activity = await ensureFixtureActivity(industry.id, category.id);
  const evidence = await ensureFixtureEvidence(activity.id);

  const unauthenticatedCommentResponse = await fetch(`${baseUrl}/activities/${activity.id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `Unauth comment ${runId}` }),
  });
  await expectStatus(unauthenticatedCommentResponse, 401, 'unauthenticated comment');

  const createProposalResponse = await fetch(`${baseUrl}/me/activity-proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: author.cookie,
    },
    body: JSON.stringify({
      granularity: 'tarea',
      industryKeys: ['smoke-industry'],
      categoryKeys: ['smoke-category'],
      translations: {
        es: {
          title: `Actividad negativa ${runId}`,
          shortDescription: 'Resumen ES negativo',
          fullDescription: 'Descripcion ES negativa',
        },
        en: {
          title: `Negative activity ${runId}`,
          shortDescription: 'Negative EN summary',
          fullDescription: 'Negative EN description',
        },
      },
    }),
  });
  const proposal = await expectOkJson(createProposalResponse, 'create negative activity proposal');

  const forbiddenProposalDetailResponse = await fetch(`${baseUrl}/me/activity-proposals/${proposal.id}`, {
    headers: {
      Cookie: secondUser.cookie,
    },
  });
  await expectStatus(forbiddenProposalDetailResponse, 404, 'foreign activity proposal detail');

  const forbiddenProposalUpdateResponse = await fetch(`${baseUrl}/me/activity-proposals/${proposal.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: secondUser.cookie,
    },
    body: JSON.stringify({
      granularity: 'funcion',
    }),
  });
  await expectStatus(forbiddenProposalUpdateResponse, 404, 'foreign activity proposal update');

  const invalidTaxonomyUpdateResponse = await fetch(`${baseUrl}/me/activity-proposals/${proposal.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: author.cookie,
    },
    body: JSON.stringify({
      granularity: 'funcion',
      industryKeys: ['missing-industry'],
      categoryKeys: ['smoke-category'],
    }),
  });
  await expectStatus(invalidTaxonomyUpdateResponse, 400, 'invalid taxonomy update');

  const activityCommentResponse = await fetch(`${baseUrl}/activities/${activity.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: author.cookie,
    },
    body: JSON.stringify({
      text: `Negative activity comment ${runId}`,
    }),
  });
  const activityComment = await expectOkJson(activityCommentResponse, 'create negative activity comment');

  const evidenceCommentResponse = await fetch(`${baseUrl}/evidence/${evidence.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: author.cookie,
    },
    body: JSON.stringify({
      text: `Negative evidence comment ${runId}`,
    }),
  });
  const evidenceComment = await expectOkJson(evidenceCommentResponse, 'create negative evidence comment');

  const firstReplyResponse = await fetch(`${baseUrl}/activities/${activity.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: secondUser.cookie,
    },
    body: JSON.stringify({
      text: `First reply ${runId}`,
      parentCommentId: activityComment.id,
    }),
  });
  const firstReply = await expectOkJson(firstReplyResponse, 'create first reply');

  const nestedReplyResponse = await fetch(`${baseUrl}/activities/${activity.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: author.cookie,
    },
    body: JSON.stringify({
      text: `Nested reply ${runId}`,
      parentCommentId: firstReply.id,
    }),
  });
  await expectStatus(nestedReplyResponse, 400, 'nested reply rejection');

  const crossEntityReplyResponse = await fetch(`${baseUrl}/activities/${activity.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: secondUser.cookie,
    },
    body: JSON.stringify({
      text: `Cross entity reply ${runId}`,
      parentCommentId: evidenceComment.id,
    }),
  });
  await expectStatus(crossEntityReplyResponse, 400, 'cross entity reply rejection');

  const selfReportResponse = await fetch(`${baseUrl}/comments/${activityComment.id}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: author.cookie,
    },
    body: JSON.stringify({
      reason: 'spam',
    }),
  });
  await expectStatus(selfReportResponse, 409, 'self report rejection');

  const emptyCommentResponse = await fetch(`${baseUrl}/activities/${activity.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: author.cookie,
    },
    body: JSON.stringify({
      text: '   ',
    }),
  });
  await expectStatus(emptyCommentResponse, 400, 'empty comment rejection');

  const reportPath = path.join(outputDir, `smoke-contributions-negative-${runId}.json`);
  await fs.promises.writeFile(
    reportPath,
    `${JSON.stringify(
      {
        runId,
        startedAt,
        finishedAt: new Date().toISOString(),
        apiBaseUrl: baseUrl,
        users: {
          authorEmail: author.body.user.email,
          secondUserEmail: secondUser.body.user.email,
        },
        fixtures: {
          activityId: activity.id,
          evidenceId: evidence.id,
        },
        validations: [
          'unauthenticated comment rejected',
          'foreign proposal detail rejected',
          'foreign proposal update rejected',
          'invalid taxonomy update rejected',
          'nested reply rejected',
          'cross entity reply rejected',
          'self report rejected',
          'empty comment rejected',
        ],
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log('Smoke contributions negative paths passed end to end.');
  console.log(`Execution report: ${reportPath}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
