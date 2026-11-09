const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const {
  PrismaClient,
  EditorialStatus,
  Granularity,
  Locale,
} = require('@prisma/client');

const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const prisma = new PrismaClient();

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
  const titleEn = `Backoffice Editorial ${suffix.toUpperCase()} ${runId}`;
  const titleEs = `Editorial Backoffice ${suffix.toUpperCase()} ${runId}`;

  return prisma.activity.create({
    data: {
      key: `backoffice-editorial-${runId}-${suffix}`,
      granularity: Granularity.tarea,
      editorialStatus: EditorialStatus.pending,
      officialAiStatus: 0,
      translations: {
        create: [
          {
            locale: Locale.en,
            title: titleEn,
            shortDescription: `Backoffice editorial short ${suffix} EN`,
            fullDescription: `Backoffice editorial full ${suffix} EN`,
            editorialSummary: withSummaries
              ? `Backoffice editorial summary ${suffix} EN ${runId}`
              : null,
            slug: `backoffice-editorial-${runId}-${suffix}`,
          },
          {
            locale: Locale.es,
            title: titleEs,
            shortDescription: `Backoffice editorial short ${suffix} ES`,
            fullDescription: `Backoffice editorial full ${suffix} ES`,
            editorialSummary: withSummaries
              ? `Resumen editorial backoffice ${suffix} ES ${runId}`
              : null,
            slug: `editorial-backoffice-${runId}-${suffix}`,
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
      type: 'report',
      sourceText: `Backoffice editorial evidence ${runId}`,
      sourceUrl: `https://example.com/backoffice-editorial-${runId}`,
      translations: {
        create: [
          {
            locale: Locale.en,
            title: `Backoffice Editorial Evidence ${runId}`,
            summary: 'Backoffice editorial evidence summary EN',
            context: 'Backoffice editorial evidence context EN',
            slug: `backoffice-editorial-evidence-${runId}`,
          },
          {
            locale: Locale.es,
            title: `Evidencia Editorial Backoffice ${runId}`,
            summary: 'Backoffice editorial evidence summary ES',
            context: 'Backoffice editorial evidence context ES',
            slug: `evidencia-editorial-backoffice-${runId}`,
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
  const [, , runIdArg] = process.argv;
  const runId = runIdArg || String(Date.now());

  const { industry, category } = await ensureFixtureTaxonomies();
  const incomplete = await createPendingEditorialFixture(
    runId,
    'incomplete',
    industry.id,
    category.id,
  );
  const ready = await createPendingEditorialFixture(
    runId,
    'ready',
    industry.id,
    category.id,
    { withSummaries: true },
  );
  await createFixtureEvidenceForActivity(runId, ready.id);

  const payload = {
    runId,
    incomplete: {
      id: incomplete.id,
      title: incomplete.translations.find((item) => item.locale === Locale.en)?.title,
      key: incomplete.key,
    },
    ready: {
      id: ready.id,
      title: ready.translations.find((item) => item.locale === Locale.en)?.title,
      key: ready.key,
    },
  };

  console.log(JSON.stringify(payload));
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
