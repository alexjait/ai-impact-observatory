const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { PrismaClient, RoleKey, SeedImportStatus, EditorialStatus } = require('@prisma/client');

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

async function expectStatus(response, expectedStatus, context) {
  const text = await response.text();
  if (response.status !== expectedStatus) {
    throw new Error(`${context} should return ${expectedStatus} but returned ${response.status}: ${text}`);
  }
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

async function promoteToAdmin(userId) {
  const adminRole = await prisma.role.findUnique({
    where: { key: RoleKey.ADMIN },
  });

  if (!adminRole) {
    throw new Error('Admin role was not bootstrapped before admin smoke.');
  }

  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: adminRole.id,
    },
  });
}

async function main() {
  await ensureOutputDir();
  const runId = Date.now();
  const startedAt = new Date().toISOString();
  const password = 'SmokeTest123!';

  const anonResponse = await fetch(`${baseUrl}/admin/seed-imports`, {
    method: 'POST',
  });
  await expectStatus(anonResponse, 401, 'anonymous seed import');

  const registeredUser = await registerUser(
    `smoke.seed.user.${runId}@example.test`,
    password,
    `Smoke Seed User ${runId}`,
  );

  const forbiddenResponse = await fetch(`${baseUrl}/admin/seed-imports`, {
    method: 'POST',
    headers: {
      Cookie: registeredUser.cookie,
    },
  });
  await expectStatus(forbiddenResponse, 403, 'non-admin seed import');

  const adminUser = await registerUser(
    `smoke.seed.admin.${runId}@example.test`,
    password,
    `Smoke Seed Admin ${runId}`,
  );
  await promoteToAdmin(adminUser.body.user.id);

  const runImportResponse = await fetch(`${baseUrl}/admin/seed-imports/reset-and-run`, {
    method: 'POST',
    headers: {
      Cookie: adminUser.cookie,
    },
  });
  const importRun = await expectOkJson(runImportResponse, 'admin seed import');
  if (!importRun?.id) {
    throw new Error('Admin seed import did not return a run id.');
  }
  if (importRun.status !== SeedImportStatus.completed) {
    throw new Error(`Admin seed import should complete successfully, got status ${importRun.status}.`);
  }
  if (!(importRun.processedRows > 0)) {
    throw new Error('Admin seed import did not process any rows.');
  }
  if (importRun.warningCount !== 0) {
    throw new Error(`Admin seed import should not emit warnings for the final seed, got ${importRun.warningCount}.`);
  }

  const getRunResponse = await fetch(`${baseUrl}/admin/seed-imports/${importRun.id}`, {
    headers: {
      Cookie: adminUser.cookie,
    },
  });
  const runSummary = await expectOkJson(getRunResponse, 'get admin seed import run');
  if (runSummary.status !== SeedImportStatus.completed) {
    throw new Error('Admin seed import summary did not report completed status.');
  }
  if (!Array.isArray(runSummary.warnings) || runSummary.warnings.length !== 0) {
    throw new Error('Admin seed import summary should not expose warning rows for the final seed.');
  }

  const missingRunResponse = await fetch(`${baseUrl}/admin/seed-imports/does-not-exist`, {
    headers: {
      Cookie: adminUser.cookie,
    },
  });
  await expectStatus(missingRunResponse, 404, 'missing seed import run');

  const completedItem = await prisma.seedImportItem.findFirst({
    where: {
      runId: importRun.id,
      status: SeedImportStatus.completed,
      sourceKey: {
        not: null,
      },
    },
    orderBy: { rowNumber: 'asc' },
  });

  if (!completedItem?.sourceKey) {
    throw new Error('Admin seed import did not persist any completed import items.');
  }
  const activityKey = completedItem.sourceKey.split('::')[0];

  const importedActivity = await prisma.activity.findUnique({
    where: { key: activityKey },
  });
  if (!importedActivity) {
    throw new Error('Admin seed import did not persist the imported activity.');
  }
  if (importedActivity.editorialStatus !== EditorialStatus.approved) {
    throw new Error('Imported activity should stay approved after final seed import.');
  }
  if (importedActivity.officialAiStatus === null || importedActivity.officialAiStatus === undefined) {
    throw new Error('Imported activity should persist official AI status from the final seed.');
  }

  const importedEvidence = await prisma.evidence.findFirst({
    where: {
      activities: {
        some: {
          activity: {
            key: activityKey,
          },
        },
      },
    },
  });
  if (!importedEvidence) {
    throw new Error('Admin seed import should persist at least one evidence item from the final seed.');
  }

  const reportPath = path.join(outputDir, `smoke-admin-seed-${runId}.json`);
  await fs.promises.writeFile(
    reportPath,
    `${JSON.stringify(
      {
        runId,
        startedAt,
        finishedAt: new Date().toISOString(),
        apiBaseUrl: baseUrl,
        importRunId: importRun.id,
        processedRows: importRun.processedRows,
        rejectedRows: importRun.rejectedRows,
        warningCount: importRun.warningCount,
        sampledImportedActivityKey: completedItem.sourceKey,
        sampledImportedEvidenceId: importedEvidence.id,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log('Smoke admin seed import passed end to end.');
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
