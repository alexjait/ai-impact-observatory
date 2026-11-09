import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

import { chromium } from "playwright-core";

const APP_BASE_URL = process.env.FRONTEND_BASE_URL ?? "http://localhost:3000";
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001/api/v1";
const OUTPUT_DIR = path.resolve("output/playwright");
const BACKEND_DIR = path.resolve("..", "backend");
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "aiio_session";
const CHROME_CANDIDATES = [
  process.env.PLAYWRIGHT_CHROME_EXECUTABLE,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function findChromeExecutable() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {}
  }

  throw new Error(
    "Could not locate a Chrome executable. Set PLAYWRIGHT_CHROME_EXECUTABLE to continue.",
  );
}

async function waitForReachable(url, label) {
  let lastError = null;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }

      lastError = new Error(`${label} responded with status ${response.status}.`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  throw new Error(`${label} is not reachable: ${String(lastError)}`);
}

async function waitForCooldown(timeMs = 1500) {
  await new Promise((resolve) => setTimeout(resolve, timeMs));
}

function extractCookie(headers) {
  const setCookies =
    typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  const sessionCookie = setCookies.find((cookie) => cookie.startsWith("aiio_session="));
  return sessionCookie ? sessionCookie.split(";")[0] : null;
}

async function expectOkJson(response, context) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${context} failed with ${response.status}: ${text}`);
  }

  return data;
}

async function registerUser(email, displayName) {
  return new Promise((resolve, reject) => {
    let stdout = "";

    const bootstrapCode = `
      const { PrismaClient } = require("@prisma/client");
      const { createHash, randomBytes } = require("node:crypto");

      const prisma = new PrismaClient();

      async function main() {
        const [email, displayName, locale, ttlHours, cookieName] = process.argv.slice(1);
        const safeLocale = locale === "es" ? "es" : "en";

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              displayName,
              isActive: true,
              termsAcceptedAt: new Date(),
              localePreference: safeLocale,
            },
          });
        }

        let identity = await prisma.authIdentity.findFirst({
          where: {
            userId: user.id,
            provider: "local",
          },
        });

        if (!identity) {
          identity = await prisma.authIdentity.create({
            data: {
              userId: user.id,
              provider: "local",
              providerUserId: email,
              email,
              emailVerifiedAt: new Date(),
              displayNameSnapshot: displayName,
            },
          });
        }

        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(token).digest("hex");
        const expiresAt = new Date(Date.now() + Number(ttlHours) * 60 * 60 * 1000);

        await prisma.session.create({
          data: {
            userId: user.id,
            authIdentityId: identity.id,
            tokenHash,
            expiresAt,
          },
        });

        console.log(JSON.stringify({
          body: { email, displayName },
          cookie: cookieName + "=" + token,
        }));
      }

      main()
        .catch((error) => {
          console.error(error);
          process.exitCode = 1;
        })
        .finally(async () => {
          await prisma.$disconnect();
        });
    `;

    const child = spawn(
      process.execPath,
      [
        "-e",
        bootstrapCode,
        email,
        displayName,
        "en",
        String(Number(process.env.SESSION_TTL_HOURS ?? 720)),
        SESSION_COOKIE_NAME,
      ],
      {
        cwd: BACKEND_DIR,
        env: process.env,
        stdio: ["ignore", "pipe", "inherit"],
      },
    );

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`register ${email} exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function getPublicActivity() {
  const response = await fetch(`${API_BASE_URL}/public/activities?locale=en&page=1&pageSize=10`);
  const body = await expectOkJson(response, "load public activities");
  const activity = Array.isArray(body.items) ? body.items[0] : null;

  if (!activity?.id || !activity?.slug) {
    throw new Error("No public activity available for backoffice smoke testing.");
  }

  return activity;
}

async function getPublicTaxonomies() {
  const response = await fetch(`${API_BASE_URL}/public/taxonomies?locale=en`);
  const body = await expectOkJson(response, "load public taxonomies");
  const industry = Array.isArray(body.industries) ? body.industries[0] : null;
  const category = Array.isArray(body.categories) ? body.categories[0] : null;

  if (!industry?.key || !category?.key) {
    throw new Error("No public taxonomies available for backoffice smoke testing.");
  }

  return { industry, category };
}

async function createActivityProposal(cookie, industryKey, categoryKey, title) {
  const response = await fetch(`${API_BASE_URL}/me/activity-proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      granularity: "tarea",
      industryKeys: [industryKey],
      categoryKeys: [categoryKey],
      translations: {
        en: {
          title,
          shortDescription: "Backoffice smoke activity proposal EN",
          fullDescription: "Backoffice smoke activity proposal full EN",
        },
        es: {
          title: `ES ${title}`,
          shortDescription: "Backoffice smoke activity proposal ES",
          fullDescription: "Backoffice smoke activity proposal full ES",
        },
      },
    }),
  });

  return expectOkJson(response, "create activity proposal");
}

async function createEvidenceProposal(cookie, activityKey, title) {
  const response = await fetch(`${API_BASE_URL}/me/evidence-proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      type: "report",
      sourceText: "Backoffice smoke evidence source text",
      sourceUrl: "https://example.com/backoffice-smoke-evidence",
      eventDate: "2026-03-29",
      activityKeys: [activityKey],
      translations: {
        en: {
          title,
          summary: "Backoffice smoke evidence summary EN",
          context: "Backoffice smoke evidence context EN",
        },
        es: {
          title: `ES ${title}`,
          summary: "Backoffice smoke evidence summary ES",
          context: "Backoffice smoke evidence context ES",
        },
      },
    }),
  });

  return expectOkJson(response, "create evidence proposal");
}

async function createReportedComment(authorCookie, reporterCookie, activityId, text) {
  const commentResponse = await fetch(`${API_BASE_URL}/activities/${activityId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authorCookie,
    },
    body: JSON.stringify({ text }),
  });
  const comment = await expectOkJson(commentResponse, "create activity comment");

  const reportResponse = await fetch(`${API_BASE_URL}/comments/${comment.id}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: reporterCookie,
    },
    body: JSON.stringify({
      reason: "spam",
      details: "Backoffice smoke report validation",
    }),
  });
  await expectOkJson(reportResponse, "report activity comment");

  return comment;
}

async function grantRoles(email, roles) {
  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join("scripts", "grant-user-roles.js"), email, ...roles],
      {
        cwd: BACKEND_DIR,
        stdio: "inherit",
      },
    );

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`grant roles exited with code ${code}`));
    });
  });
}

async function createEditorialFixtures(runId) {
  return new Promise((resolve, reject) => {
    let stdout = "";

    const child = spawn(
      process.execPath,
      [path.join("scripts", "create-editorial-fixtures.js"), String(runId)],
      {
        cwd: BACKEND_DIR,
        stdio: ["ignore", "pipe", "inherit"],
      },
    );

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`create editorial fixtures exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function bootstrapBackofficeSession(page, cookie) {
  const cookieValue = cookie.startsWith(`${SESSION_COOKIE_NAME}=`)
    ? cookie.slice(`${SESSION_COOKIE_NAME}=`.length)
    : cookie;

  await page.context().addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: cookieValue,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto(`${APP_BASE_URL}/backoffice?locale=en`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForURL(/\/backoffice(?:\?locale=en)?$/, { timeout: 15000 });
}

async function writeReport(reportPath, report) {
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function run() {
  await ensureOutputDir();
  await waitForReachable(`${API_BASE_URL}/health`, "Backend health endpoint");
  await waitForReachable(`${APP_BASE_URL}?locale=en`, "Frontend application");

  const timestamp = Date.now();
  const operatorEmail = `backoffice-operator-${timestamp}@example.com`;
  const operatorName = `Backoffice Operator ${timestamp}`;
  const authorEmail = `backoffice-author-${timestamp}@example.com`;
  const authorName = `Backoffice Author ${timestamp}`;
  const reporterEmail = `backoffice-reporter-${timestamp}@example.com`;
  const reporterName = `Backoffice Reporter ${timestamp}`;
  const activityProposalTitle = `Backoffice activity proposal ${timestamp}`;
  const evidenceProposalTitle = `Backoffice evidence proposal ${timestamp}`;
  const commentText = `Backoffice reported comment ${timestamp}`;
  const summaryEn = `Backoffice smoke summary EN ${timestamp}`;
  const summaryEs = `Backoffice smoke summary ES ${timestamp}`;
  const screenshotPath = path.join(OUTPUT_DIR, `smoke-backoffice-${timestamp}.png`);
  const reportPath = path.join(OUTPUT_DIR, `smoke-backoffice-${timestamp}.json`);

  console.log("Preparing operator and moderation fixtures...");
  const publicActivity = await getPublicActivity();
  const taxonomies = await getPublicTaxonomies();
  const editorialFixtures = await createEditorialFixtures(timestamp);
  const operator = await registerUser(operatorEmail, operatorName);
  await grantRoles(operatorEmail, ["ADMIN", "EDITOR", "MODERATOR"]);
  const author = await registerUser(authorEmail, authorName);
  const reporter = await registerUser(reporterEmail, reporterName);
  await createActivityProposal(
    author.cookie,
    taxonomies.industry.key,
    taxonomies.category.key,
    activityProposalTitle,
  );
  await createEvidenceProposal(author.cookie, publicActivity.key, evidenceProposalTitle);
  await createReportedComment(author.cookie, reporter.cookie, publicActivity.id, commentText);

  const executablePath = await findChromeExecutable();
  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const page = await context.newPage();

  try {
    console.log("Checking anonymous access guard on backoffice...");
    await page.goto(`${APP_BASE_URL}/backoffice?locale=en`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("heading", { name: "Sign in to access backoffice" }).waitFor();

    console.log("Bootstrapping operator session for the backoffice smoke...");
    await bootstrapBackofficeSession(page, operator.cookie);
    await page.getByRole("heading", { name: "Choose an operational lane" }).waitFor();
    await page.getByText("activity proposals pending", { exact: false }).waitFor();

    console.log("Inspecting an activity proposal through visible moderation search...");
    await page.goto(`${APP_BASE_URL}/backoffice/moderation?locale=en&type=activity_proposals`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByLabel("Search inside this lane").fill(activityProposalTitle);
    await page.getByRole("button", { name: "Search" }).click();
    const activityProposalCard = page.locator("article.backoffice-card").filter({
      hasText: activityProposalTitle,
    }).first();
    await activityProposalCard.waitFor({ timeout: 15000 });
    await activityProposalCard.getByRole("button", { name: "Inspect detail" }).click();
    await activityProposalCard.getByText("Backoffice smoke activity proposal EN").waitFor({
      timeout: 15000,
    });
    await activityProposalCard.getByLabel("Moderator note").fill("Backoffice activity moderation note");
    await activityProposalCard.getByRole("button", { name: "Request correction" }).click();
    await page.getByText("Correction requested.", { exact: false }).waitFor({ timeout: 15000 });

    console.log("Moderating the seeded smoke evidence proposal...");
    await page.goto(`${APP_BASE_URL}/backoffice/moderation?locale=en&type=evidence_proposals`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByLabel("Search inside this lane").fill(evidenceProposalTitle);
    await page.getByRole("button", { name: "Search" }).click();
    const proposalCard = page.locator("article.backoffice-card").filter({
      hasText: evidenceProposalTitle,
    }).first();
    await proposalCard.waitFor({ timeout: 15000 });
    await proposalCard.getByRole("button", { name: "Inspect detail" }).click();
    await proposalCard.getByRole("link", { name: "Open source" }).waitFor({ timeout: 15000 });
    await proposalCard.getByLabel("Moderator note").fill("Backoffice smoke moderation note");
    await proposalCard.getByRole("button", { name: "Request correction" }).click();
    await page.getByText("Correction requested.", { exact: false }).waitFor({ timeout: 15000 });

    console.log("Resolving the reported comment from the moderation queue...");
    await page.goto(`${APP_BASE_URL}/backoffice/moderation?locale=en&type=comments`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByLabel("Search inside this lane").fill(publicActivity.key);
    await page.getByRole("button", { name: "Search" }).click();
    const commentCard = page.locator("article.backoffice-card").filter({
      hasText: commentText,
    }).first();
    await commentCard.waitFor({ timeout: 15000 });
    await page.waitForFunction(
      ({ text, key }) => {
        const cards = Array.from(document.querySelectorAll("article.backoffice-card"));
        const target = cards.find((card) => card.textContent?.includes(text));
        return Boolean(target?.textContent?.includes(key));
      },
      { text: commentText, key: publicActivity.key },
      { timeout: 15000 },
    );
    await commentCard.getByLabel("Moderator note").fill("Backoffice smoke report resolution");
    await commentCard.getByRole("button", { name: "Resolve report" }).click();
    await page.getByText("Report resolved.", { exact: false }).waitFor({ timeout: 15000 });

    console.log("Validating guarded and successful editorial bulk actions from the UI...");
    await waitForCooldown();
    await page.goto(`${APP_BASE_URL}/backoffice/editorial?locale=en&status=pending`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("heading", { name: "Imported activities workspace" }).waitFor();
    await page.getByRole("button", { name: "Apply filters" }).waitFor();
    const bulkPanel = page.getByTestId("editorial-bulk-panel");
    await page.getByLabel("Search term").fill(editorialFixtures.incomplete.title);
    await page.getByRole("button", { name: "Apply filters" }).click();
    await page
      .locator("article.backoffice-card")
      .filter({ hasText: editorialFixtures.incomplete.title })
      .first()
      .waitFor({
        timeout: 15000,
      });
    await page.locator('article.backoffice-card input[type="checkbox"]').first().check();
    await bulkPanel.getByLabel("Editorial status").selectOption("approved");
    await bulkPanel.getByLabel("Official AI status").selectOption("4");
    await bulkPanel.getByLabel("Rationale").fill("Backoffice guarded bulk approval");
    await bulkPanel.getByRole("button", { name: "Apply bulk action" }).click();
    await page.getByText("0 updated, 1 skipped.", { exact: false }).waitFor({
      timeout: 15000,
    });
    await page.getByText("bilingual editorial summaries", { exact: false }).waitFor({
      timeout: 15000,
    });

    await page.goto(`${APP_BASE_URL}/backoffice/editorial?locale=en&status=pending`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("heading", { name: "Imported activities workspace" }).waitFor();
    await page.getByLabel("Search term").fill(editorialFixtures.ready.title);
    await page.getByRole("button", { name: "Apply filters" }).click();
    const readyCard = page.locator("article.backoffice-card").filter({
      hasText: editorialFixtures.ready.title,
    }).first();
    await readyCard.waitFor({ timeout: 15000 });
    await readyCard.locator('input[type="checkbox"]').check();
    await bulkPanel.getByLabel("Editorial status").selectOption("approved");
    await bulkPanel.getByLabel("Official AI status").selectOption("4");
    await bulkPanel.getByLabel("Rationale").fill("Backoffice bulk editorial approval");
    await bulkPanel.getByRole("button", { name: "Apply bulk action" }).click();
    await page.getByText("Bulk action completed", { exact: false }).waitFor({
      timeout: 15000,
    });
    await page.getByText("1 updated, 0 skipped.", { exact: false }).waitFor({
      timeout: 15000,
    });

    console.log("Updating an editorial summary from the workspace...");
    await page.goto(`${APP_BASE_URL}/backoffice/editorial?locale=en&status=approved`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("heading", { name: "Imported activities workspace" }).waitFor();
    await page.getByLabel("Search term").fill(editorialFixtures.ready.title);
    await page.getByRole("button", { name: "Apply filters" }).click();
    await page
      .locator("article.backoffice-card")
      .filter({ hasText: editorialFixtures.ready.title })
      .first()
      .getByRole("link", { name: "Open workspace" })
      .click();
    await page.getByRole("heading", { name: /.+/ }).first().waitFor();
    await page.getByText(/Lane .* activities\./).waitFor({ timeout: 15000 });
    await page.getByRole("heading", { name: "Move faster after each editorial decision" }).waitFor({
      timeout: 15000,
    });
    await page.getByRole("link", { name: "Open selected target lane" }).waitFor({
      timeout: 15000,
    });
    const summaryTextareas = page.locator("textarea");
    await summaryTextareas.nth(0).fill(summaryEn);
    await summaryTextareas.nth(1).fill(summaryEs);
    await page.getByRole("button", { name: "Save summaries and return to lane" }).click();
    await page.waitForURL(/\/backoffice\/editorial\?/, { timeout: 15000 });
    await page.getByRole("heading", { name: "Imported activities workspace" }).waitFor({
      timeout: 15000,
    });
    await page.getByText(editorialFixtures.ready.title, { exact: false }).waitFor({
      timeout: 15000,
    });
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await writeReport(reportPath, {
      executedAt: new Date(timestamp).toISOString(),
      frontendBaseUrl: APP_BASE_URL,
      apiBaseUrl: API_BASE_URL,
      operatorEmail,
      authorEmail,
      reporterEmail,
      activityProposalTitle,
      evidenceProposalTitle,
      commentText,
      editorialFixtureIncompleteTitle: editorialFixtures.incomplete.title,
      editorialFixtureReadyTitle: editorialFixtures.ready.title,
      summaryEn,
      summaryEs,
      artifacts: {
        screenshotPath,
        reportPath,
      },
    });

    assert.ok(true);
    console.log("Backoffice smoke passed.");
    console.log(`Screenshot: ${screenshotPath}`);
    console.log(`Execution report: ${reportPath}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

run().catch((error) => {
  console.error("Backoffice smoke failed.");
  console.error(error);
  process.exitCode = 1;
});
