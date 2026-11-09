const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const {
  PrismaClient,
  EditorialStatus,
  Granularity,
  Locale,
  ReliabilityFlag,
} = require('@prisma/client');

const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const prisma = new PrismaClient();
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
const baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/v1`;
const outputDir = path.resolve(__dirname, '..', '..', 'output', 'testing');

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

async function ensureFixtureTaxonomies() {
  let industry = await prisma.industry.findUnique({
    where: { key: 'smoke-public-industry' },
  });

  if (!industry) {
    industry = await prisma.industry.create({
      data: {
        key: 'smoke-public-industry',
        translations: {
          create: [
            { locale: Locale.en, name: 'Smoke Public Industry', slug: 'smoke-public-industry' },
            { locale: Locale.es, name: 'Industria Publica Smoke', slug: 'industria-publica-smoke' },
          ],
        },
      },
    });
  }

  let category = await prisma.functionalCategory.findUnique({
    where: { key: 'smoke-public-category' },
  });

  if (!category) {
    category = await prisma.functionalCategory.create({
      data: {
        key: 'smoke-public-category',
        translations: {
          create: [
            { locale: Locale.en, name: 'Smoke Public Category', slug: 'smoke-public-category' },
            { locale: Locale.es, name: 'Categoria Publica Smoke', slug: 'categoria-publica-smoke' },
          ],
        },
      },
    });
  }

  return { industry, category };
}

async function ensureApprovedActivity(industryId, categoryId) {
  const existing = await prisma.activity.findUnique({
    where: { key: 'smoke-public-activity' },
  });

  if (existing) {
    return existing;
  }

  return prisma.activity.create({
    data: {
      key: 'smoke-public-activity',
      granularity: Granularity.funcion,
      editorialStatus: EditorialStatus.approved,
      officialAiStatus: 3,
      translations: {
        create: [
          {
            locale: Locale.en,
            title: 'Smoke Public Activity',
            shortDescription: 'Smoke public activity short description',
            fullDescription: 'Smoke public activity full description',
            editorialSummary: 'Smoke public activity editorial summary',
            slug: 'smoke-public-activity',
          },
          {
            locale: Locale.es,
            title: 'Actividad Publica Smoke',
            shortDescription: 'Descripcion corta publica smoke',
            fullDescription: 'Descripcion completa publica smoke',
            editorialSummary: 'Resumen editorial publico smoke',
            slug: 'actividad-publica-smoke',
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

async function ensureHiddenActivity(industryId, categoryId) {
  const existing = await prisma.activity.findUnique({
    where: { key: 'smoke-hidden-activity' },
  });

  if (existing) {
    return existing;
  }

  return prisma.activity.create({
    data: {
      key: 'smoke-hidden-activity',
      granularity: Granularity.tarea,
      editorialStatus: EditorialStatus.pending,
      translations: {
        create: [
          {
            locale: Locale.en,
            title: 'Smoke Hidden Activity',
            shortDescription: 'Should stay hidden from public catalog',
            slug: 'smoke-hidden-activity',
          },
          {
            locale: Locale.es,
            title: 'Actividad Oculta Smoke',
            shortDescription: 'Debe quedar oculta del catalogo publico',
            slug: 'actividad-oculta-smoke',
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

async function ensureApprovedEvidence(activityId) {
  const existing = await prisma.evidence.findFirst({
    where: {
      translations: {
        some: {
          locale: Locale.en,
          slug: 'smoke-public-evidence',
        },
      },
    },
  });

  if (existing) {
    return prisma.evidence.update({
      where: { id: existing.id },
      data: {
        eventDate: new Date('2025-12-16T00:00:00.000Z'),
      },
    });
  }

  return prisma.evidence.create({
    data: {
      editorialStatus: EditorialStatus.approved,
      type: 'report',
      sourceText: 'Smoke public evidence source',
      sourceUrl: 'https://example.com/smoke-public-evidence',
      eventDate: new Date('2025-12-16T00:00:00.000Z'),
      reliabilityFlag: ReliabilityFlag.low_confidence,
      translations: {
        create: [
          {
            locale: Locale.en,
            title: 'Smoke Public Evidence',
            summary: 'Smoke public evidence summary',
            context: 'Smoke public evidence context',
            slug: 'smoke-public-evidence',
          },
          {
            locale: Locale.es,
            title: 'Evidencia Publica Smoke',
            summary: 'Resumen de evidencia publica smoke',
            context: 'Contexto de evidencia publica smoke',
            slug: 'evidencia-publica-smoke',
          },
        ],
      },
      activities: {
        create: [{ activityId }],
      },
    },
  });
}

async function ensureHiddenEvidence(activityId) {
  const existing = await prisma.evidence.findFirst({
    where: {
      translations: {
        some: {
          locale: Locale.en,
          slug: 'smoke-hidden-evidence',
        },
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.evidence.create({
    data: {
      editorialStatus: EditorialStatus.pending,
      type: 'internal_note',
      sourceText: 'Smoke hidden evidence source',
      translations: {
        create: [
          {
            locale: Locale.en,
            title: 'Smoke Hidden Evidence',
            summary: 'Should stay hidden from public evidence detail',
            context: 'Hidden smoke evidence context',
            slug: 'smoke-hidden-evidence',
          },
          {
            locale: Locale.es,
            title: 'Evidencia Oculta Smoke',
            summary: 'Debe quedar oculta de la evidencia publica',
            context: 'Contexto oculto smoke',
            slug: 'evidencia-oculta-smoke',
          },
        ],
      },
      activities: {
        create: [{ activityId }],
      },
    },
  });
}

async function expectNotFound(response, context) {
  const text = await response.text();
  if (response.status !== 404) {
    throw new Error(`${context} should return 404 but returned ${response.status}: ${text}`);
  }
}

function extractCookieValue(setCookieHeader, cookieName) {
  if (!setCookieHeader) {
    throw new Error(`Missing Set-Cookie header for ${cookieName}.`);
  }

  const cookiePart = setCookieHeader
    .split(',')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));

  if (!cookiePart) {
    throw new Error(`Could not find cookie ${cookieName} in Set-Cookie header.`);
  }

  return cookiePart.split(';')[0].slice(cookieName.length + 1);
}

async function registerSmokeUser(runId) {
  const email = `smoke-follow-${runId}@example.com`;
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      displayName: `Smoke Follow ${runId}`,
      password: 'Passw0rd!234',
      termsAccepted: true,
    }),
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Could not register smoke follow user: ${response.status} ${text}`);
  }

  return {
    userId: body?.user?.id,
    email,
    sessionCookie: extractCookieValue(response.headers.get('set-cookie'), 'aiio_session'),
  };
}

async function main() {
  await ensureOutputDir();
  const runId = Date.now();
  const startedAt = new Date().toISOString();

  const { industry, category } = await ensureFixtureTaxonomies();
  const activity = await ensureApprovedActivity(industry.id, category.id);
  const hiddenActivity = await ensureHiddenActivity(industry.id, category.id);
  const evidence = await ensureApprovedEvidence(activity.id);
  await ensureHiddenEvidence(activity.id);
  const followUser = await registerSmokeUser(runId);

  await prisma.activityFollow.createMany({
    data: [
      {
        userId: followUser.userId,
        activityId: activity.id,
      },
      {
        userId: followUser.userId,
        activityId: hiddenActivity.id,
      },
    ],
    skipDuplicates: true,
  });

  const methodologyEnResponse = await fetch(`${baseUrl}/public/methodology?locale=en`);
  const methodologyEn = await expectOkJson(methodologyEnResponse, 'public methodology en');
  if (
    methodologyEn.title !== 'Methodology' ||
    !Array.isArray(methodologyEn.scale) ||
    methodologyEn.scale.length !== 6 ||
    !Array.isArray(methodologyEn.levels) ||
    methodologyEn.levels.length !== 6
  ) {
    throw new Error('English methodology payload is incomplete.');
  }

  const methodologyEsResponse = await fetch(`${baseUrl}/public/methodology?locale=es`);
  const methodologyEs = await expectOkJson(methodologyEsResponse, 'public methodology es');
  if (
    methodologyEs.title !== 'Metodología' ||
    !Array.isArray(methodologyEs.scale) ||
    methodologyEs.scale.length !== 6 ||
    !Array.isArray(methodologyEs.levels) ||
    methodologyEs.levels.length !== 6
  ) {
    throw new Error('Spanish methodology payload is incomplete.');
  }

  const taxonomiesEnResponse = await fetch(`${baseUrl}/public/taxonomies?locale=en`);
  const taxonomiesEn = await expectOkJson(taxonomiesEnResponse, 'public taxonomies en');
  if (!taxonomiesEn.industries.find((item) => item.key === 'smoke-public-industry' && item.name === 'Smoke Public Industry')) {
    throw new Error('English taxonomies payload is missing the smoke public industry.');
  }
  if (!taxonomiesEn.categories.find((item) => item.key === 'smoke-public-category' && item.name === 'Smoke Public Category')) {
    throw new Error('English taxonomies payload is missing the smoke public category.');
  }

  const taxonomiesEsResponse = await fetch(`${baseUrl}/public/taxonomies?locale=es`);
  const taxonomiesEs = await expectOkJson(taxonomiesEsResponse, 'public taxonomies es');
  if (!taxonomiesEs.industries.find((item) => item.key === 'smoke-public-industry' && item.name === 'Industria Publica Smoke')) {
    throw new Error('Spanish taxonomies payload is missing the smoke public industry translation.');
  }
  if (!taxonomiesEs.categories.find((item) => item.key === 'smoke-public-category' && item.name === 'Categoria Publica Smoke')) {
    throw new Error('Spanish taxonomies payload is missing the smoke public category translation.');
  }
  const esCategoryNames = taxonomiesEs.categories.map((item) => item.name);
  const sortedEsCategoryNames = [...esCategoryNames].sort((left, right) =>
    left.localeCompare(right, 'es', { sensitivity: 'base', ignorePunctuation: true }),
  );
  if (JSON.stringify(esCategoryNames) !== JSON.stringify(sortedEsCategoryNames)) {
    throw new Error('Spanish category taxonomies should be alphabetically ordered.');
  }

  const activitiesEnResponse = await fetch(
    `${baseUrl}/public/activities?locale=en&industry=smoke-public-industry&category=smoke-public-category`,
  );
  const activitiesEn = await expectOkJson(activitiesEnResponse, 'public activities en');
  if (!Array.isArray(activitiesEn.items) || !activitiesEn.items.find((item) => item.slug === 'smoke-public-activity')) {
    throw new Error('Public activities listing is missing the approved smoke activity.');
  }
  if (activitiesEn.items.find((item) => item.slug === 'smoke-hidden-activity')) {
    throw new Error('Public activities listing should not expose pending activities.');
  }

  const searchResponse = await fetch(`${baseUrl}/public/search?locale=en&q=Smoke Public Activity`);
  const searchPayload = await expectOkJson(searchResponse, 'public search');
  if (!Array.isArray(searchPayload.items) || !searchPayload.items.find((item) => item.slug === 'smoke-public-activity')) {
    throw new Error('Public search should expose the approved smoke public activity.');
  }

  const anonymousFollowedResponse = await fetch(
    `${baseUrl}/public/activities?locale=en&followed=true`,
  );
  const anonymousFollowed = await expectOkJson(anonymousFollowedResponse, 'anonymous followed activities');
  if ((anonymousFollowed.items?.length ?? 0) !== 0) {
    throw new Error('Anonymous followed filter should not expose any activities.');
  }

  const followedActivitiesResponse = await fetch(
    `${baseUrl}/public/activities?locale=en&followed=true`,
    {
      headers: {
        Cookie: `aiio_session=${followUser.sessionCookie}`,
      },
    },
  );
  const followedActivities = await expectOkJson(
    followedActivitiesResponse,
    'authenticated followed activities',
  );
  if (!Array.isArray(followedActivities.items) || followedActivities.items.length < 2) {
    throw new Error('Authenticated followed activities should return followed public and hidden items.');
  }
  const followedPublic = followedActivities.items.find((item) => item.slug === 'smoke-public-activity');
  const followedHidden = followedActivities.items.find((item) => item.slug === 'smoke-hidden-activity');
  if (!followedPublic?.isFollowing || followedPublic?.isPubliclyVisible !== true) {
    throw new Error('Public followed activity should be flagged as following and publicly visible.');
  }
  if (!followedHidden?.isFollowing || followedHidden?.isPubliclyVisible !== false) {
    throw new Error('Hidden followed activity should stay visible only in followed results.');
  }

  const followedActivitiesMeResponse = await fetch(
    `${baseUrl}/me/followed-activities?locale=en`,
    {
      headers: {
        Cookie: `aiio_session=${followUser.sessionCookie}`,
      },
    },
  );
  const followedActivitiesMe = await expectOkJson(
    followedActivitiesMeResponse,
    'me followed activities',
  );
  if (!Array.isArray(followedActivitiesMe) || followedActivitiesMe.length < 2) {
    throw new Error('My followed activities should include all tracked items.');
  }

  const activityEnResponse = await fetch(`${baseUrl}/public/activities/smoke-public-activity?locale=en`);
  const activityEn = await expectOkJson(activityEnResponse, 'public activity en');
  if (activityEn.title !== 'Smoke Public Activity') {
    throw new Error('Public activity English detail did not resolve the expected translation.');
  }
  if (!Array.isArray(activityEn.evidences) || !activityEn.evidences.find((item) => item.slug === 'smoke-public-evidence')) {
    throw new Error('Public activity detail is missing the approved evidence link.');
  }
  if (activityEn.evidences.find((item) => item.slug === 'smoke-hidden-evidence')) {
    throw new Error('Public activity detail should not expose pending evidence.');
  }
  if (activityEn.evidences[0]?.eventDate !== '2025-12-16T00:00:00.000Z') {
    throw new Error('Public activity detail should expose the evidence event date.');
  }

  const activityFollowedResponse = await fetch(
    `${baseUrl}/public/activities/smoke-public-activity?locale=en`,
    {
      headers: {
        Cookie: `aiio_session=${followUser.sessionCookie}`,
      },
    },
  );
  const activityFollowed = await expectOkJson(activityFollowedResponse, 'public activity with follow state');
  if (activityFollowed.isFollowing !== true) {
    throw new Error('Public activity detail should expose isFollowing for authenticated users.');
  }

  const activityEsResponse = await fetch(`${baseUrl}/public/activities/actividad-publica-smoke?locale=es`);
  const activityEs = await expectOkJson(activityEsResponse, 'public activity es');
  if (activityEs.title !== 'Actividad Publica Smoke') {
    throw new Error('Public activity Spanish detail did not resolve the expected translation.');
  }

  const hiddenActivityResponse = await fetch(`${baseUrl}/public/activities/smoke-hidden-activity?locale=en`);
  await expectNotFound(hiddenActivityResponse, 'pending public activity detail');

  const evidenceEnResponse = await fetch(`${baseUrl}/public/evidence/smoke-public-evidence?locale=en`);
  const evidenceEn = await expectOkJson(evidenceEnResponse, 'public evidence en');
  if (evidenceEn.title !== 'Smoke Public Evidence') {
    throw new Error('Public evidence English detail did not resolve the expected translation.');
  }
  if (evidenceEn.showReliabilityWarning !== undefined) {
    // no-op: keep compatibility if field appears later
  }
  if (!Array.isArray(evidenceEn.activities) || !evidenceEn.activities.find((item) => item.slug === 'smoke-public-activity')) {
    throw new Error('Public evidence detail is missing the related approved activity.');
  }
  if (evidenceEn.reliabilityFlag !== ReliabilityFlag.low_confidence) {
    throw new Error('Public evidence detail did not expose the expected reliability flag.');
  }
  if (evidenceEn.eventDate !== '2025-12-16T00:00:00.000Z') {
    throw new Error('Public evidence detail did not expose the expected event date.');
  }

  const evidenceEsResponse = await fetch(`${baseUrl}/public/evidence/evidencia-publica-smoke?locale=es`);
  const evidenceEs = await expectOkJson(evidenceEsResponse, 'public evidence es');
  if (evidenceEs.title !== 'Evidencia Publica Smoke') {
    throw new Error('Public evidence Spanish detail did not resolve the expected translation.');
  }

  const hiddenEvidenceResponse = await fetch(`${baseUrl}/public/evidence/smoke-hidden-evidence?locale=en`);
  await expectNotFound(hiddenEvidenceResponse, 'pending public evidence detail');

  const reportPath = path.join(outputDir, `smoke-public-catalog-${runId}.json`);
  await fs.promises.writeFile(
    reportPath,
    `${JSON.stringify(
      {
        runId,
        startedAt,
        finishedAt: new Date().toISOString(),
        apiBaseUrl: baseUrl,
        fixtures: {
          industryKey: industry.key,
        categoryKey: category.key,
        activityId: activity.id,
        hiddenActivityId: hiddenActivity.id,
        activitySlugEn: 'smoke-public-activity',
        activitySlugEs: 'actividad-publica-smoke',
        evidenceId: evidence.id,
        evidenceSlugEn: 'smoke-public-evidence',
        evidenceSlugEs: 'evidencia-publica-smoke',
        followedUserEmail: followUser.email,
      },
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log('Smoke public catalog passed end to end.');
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
