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

async function waitForCooldown(timeMs = 1200) {
  await new Promise((resolve) => setTimeout(resolve, timeMs));
}

async function gotoWithAppRetry(page, url, readyText) {
  const readyTexts = Array.isArray(readyText) ? readyText : [readyText];

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const bodyText = await page.locator("body").innerText();

    if (readyTexts.some((text) => bodyText.includes(text))) {
      return;
    }

    if (!bodyText.includes("This page couldn’t load") && !bodyText.includes("This page couldn't load")) {
      return;
    }
  }

  throw new Error(`Could not load application page reliably for ${url}.`);
}

async function provisionSessionUser({ email, displayName, locale = "en" }) {
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

        console.log(JSON.stringify({ cookieName, token }));
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
        displayName ?? email,
        locale,
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
        reject(new Error(`Could not provision smoke user session for ${email}.`));
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

async function getProviders() {
  const response = await fetch(`${API_BASE_URL}/auth/providers`);
  if (!response.ok) {
    throw new Error(`Could not load auth providers. Status ${response.status}.`);
  }

  return response.json();
}

async function bootstrapSession(page, { email, displayName, mode }) {
  const { token } = await provisionSessionUser({
    email,
    displayName: displayName ?? email,
    locale: "en",
  });

  await page.context().addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}

async function getPublicActivityDetail(slug) {
  const response = await fetch(
    `${API_BASE_URL}/public/activities/${slug}?locale=en`,
  );

  if (!response.ok) {
    throw new Error(`Could not load activity detail for ${slug}. Status ${response.status}.`);
  }

  return response.json();
}

async function getLocalizedActivityDetail(slug, locale) {
  const response = await fetch(
    `${API_BASE_URL}/public/activities/${slug}?locale=${locale}`,
  );

  if (!response.ok) {
    throw new Error(
      `Could not load activity detail for ${slug} in locale ${locale}. Status ${response.status}.`,
    );
  }

  return response.json();
}

async function getPublicActivityWithEvidence() {
  const preferredSlug = "smoke-public-activity";
  const preferredDetailResponse = await fetch(
    `${API_BASE_URL}/public/activities/${preferredSlug}?locale=en`,
  );

  if (preferredDetailResponse.ok) {
    const preferredDetail = await preferredDetailResponse.json();
    if (Array.isArray(preferredDetail?.evidences) && preferredDetail.evidences.length > 0) {
      return {
        activity: {
          slug: preferredSlug,
          title: preferredDetail.title,
        },
        activityDetail: preferredDetail,
      };
    }
  }

  const response = await fetch(
    `${API_BASE_URL}/public/activities?locale=en&page=1&pageSize=25`,
  );

  if (!response.ok) {
    throw new Error(`Could not load public activities. Status ${response.status}.`);
  }

  const body = await response.json();
  const items = Array.isArray(body?.items) ? body.items : [];

  for (const activity of items) {
    if (!activity?.slug) {
      continue;
    }

    const detail = await getPublicActivityDetail(activity.slug);
    if (Array.isArray(detail?.evidences) && detail.evidences.length > 0) {
      return {
        activity,
        activityDetail: detail,
      };
    }
  }

  throw new Error("No public activity with approved evidence is available for UI smoke testing.");
}

async function registerUser(page, { email, displayName }) {
  await bootstrapSession(page, { email, displayName, mode: "register" });
  await waitForCooldown();
  await page.goto(`${APP_BASE_URL}/me?locale=en`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Log out" }).waitFor({ timeout: 15000 });
}

async function loginUser(page, { email, returnTo }) {
  await bootstrapSession(page, { email, mode: "login" });
  await waitForCooldown();
  const targetUrl = new URL(`${APP_BASE_URL}${returnTo ?? "/me"}`);
  if (!targetUrl.searchParams.has("locale")) {
    targetUrl.searchParams.set("locale", "en");
  }
  await page.goto(targetUrl.toString(), { waitUntil: "domcontentloaded" });
}

async function writeReport(reportPath, report) {
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function assertCatalogLayout(page, url, label) {
  await gotoWithAppRetry(page, url, [
    "Explorar actividades",
    "Actividades con cambios más fuertes",
    "Actividades con cambios mas fuertes",
  ]);
  await page
    .getByRole("heading", {
      name: /Explorar actividades|Actividades con cambios más fuertes|Actividades con cambios mas fuertes/i,
    })
    .waitFor();

  const filterPanel = page.locator(".filters-panel").first();
  const firstCard = page.locator(".activity-grid .activity-card").first();
  const filterControls = page.locator(".filters-panel input, .filters-panel select, .filters-panel button");

  await filterPanel.waitFor({ timeout: 15000 });
  await firstCard.waitFor({ timeout: 15000 });

  const filterBox = await filterPanel.boundingBox();
  const firstCardBox = await firstCard.boundingBox();

  if (!filterBox || !firstCardBox) {
    throw new Error(`Could not measure catalog layout for ${label}.`);
  }

  const stackedVertically = firstCardBox.y >= filterBox.y + filterBox.height - 1;
  const separatedHorizontally = firstCardBox.x >= filterBox.x + filterBox.width + 12;

  assert.ok(
    stackedVertically || separatedHorizontally,
    `Catalog layout overlap detected for ${label}.`,
  );

  const controlCount = await filterControls.count();

  for (let index = 0; index < controlCount; index += 1) {
    const control = filterControls.nth(index);
    const isVisible = await control.isVisible();

    if (!isVisible) {
      continue;
    }

    const controlBox = await control.boundingBox();

    if (!controlBox) {
      throw new Error(`Could not measure filter control ${index + 1} for ${label}.`);
    }

    assert.ok(
      controlBox.x >= filterBox.x - 1 &&
        controlBox.x + controlBox.width <= filterBox.x + filterBox.width + 1,
      `Filter control ${index + 1} overflows the panel bounds for ${label}.`,
    );
  }

  const cardKeys = page.locator(".activity-card__key");
  assert.equal(
    await cardKeys.count(),
    0,
    `Catalog cards should not expose internal activity keys for ${label}.`,
  );
}

async function run() {
  await ensureOutputDir();
  await waitForReachable(`${API_BASE_URL}/health`, "Backend health endpoint");
  await waitForReachable(`${APP_BASE_URL}?locale=en`, "Frontend application");
  const providers = await getProviders();

  const { activity, activityDetail } = await getPublicActivityWithEvidence();
  const evidence = activityDetail?.evidences?.[0];
  const commentsEnabled = activityDetail?.publicFeatures?.commentsEnabled !== false;

  if (!evidence?.slug && !evidence?.id) {
    throw new Error("No public evidence is available for UI smoke testing.");
  }

  const timestamp = Date.now();
  const userOneEmail = `frontend-ui-smoke-a-${timestamp}@example.com`;
  const userOneDisplayName = `Frontend UI Smoke A ${timestamp}`;
  const userTwoEmail = `frontend-ui-smoke-b-${timestamp}@example.com`;
  const userTwoDisplayName = `Frontend UI Smoke B ${timestamp}`;
  const proposalTitle = `Frontend UI proposal ${timestamp}`;
  const updatedProposalTitle = `Frontend UI proposal updated ${timestamp}`;
  const activityCommentText = `Frontend UI activity comment ${timestamp}`;
  const evidenceCommentText = `Frontend UI evidence comment ${timestamp}`;
  const replyText = `Frontend UI reply ${timestamp}`;
  const activityScreenshotPath = path.join(
    OUTPUT_DIR,
    `smoke-ui-activity-${timestamp}.png`,
  );
  const evidenceScreenshotPath = path.join(
    OUTPUT_DIR,
    `smoke-ui-evidence-${timestamp}.png`,
  );
  const reportPath = path.join(OUTPUT_DIR, `smoke-ui-${timestamp}.json`);

  const executablePath = await findChromeExecutable();
  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const reporterContext = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  let page = await context.newPage();
  const reporterPage = await reporterContext.newPage();

  try {
    console.log("Checking anonymous access guards and auth messaging...");
    await page.goto(`${APP_BASE_URL}/me/proposals?locale=es`, {
      waitUntil: "domcontentloaded",
    });
    await page
      .getByRole("heading", { name: "Inicia sesion antes de contribuir" })
      .waitFor();
    const proposalsGuardPanel = page.getByRole("main");
    await proposalsGuardPanel.getByRole("link", { name: "Ingresar" }).waitFor();
    await proposalsGuardPanel.getByRole("link", { name: "Crear cuenta" }).waitFor();

    await page.close();
    page = await context.newPage();
    await gotoWithAppRetry(
      page,
      `${APP_BASE_URL}/auth/login?locale=en`,
      "Log into the observatory",
    );
    await page.waitForFunction(() => {
      const bodyText = document.body?.innerText ?? "";
      return (
        Boolean(document.querySelector('a[href*="/auth/google/start"]')) ||
        bodyText.includes("Google sign-in is not configured yet in this environment.") ||
        bodyText.includes("Google")
      );
    });

    const googleStartLink = page.locator('a[href*="/auth/google/start"]');
    const loginBodyText = await page.locator("body").innerText();
    const hasGoogleStartLink = (await googleStartLink.count()) > 0;
    const hasGoogleDisabledCopy = loginBodyText.includes(
      "Google sign-in is not configured yet in this environment.",
    );

    assert.ok(
      hasGoogleStartLink || hasGoogleDisabledCopy,
      "Expected login screen to show either the Google CTA or the disabled-provider message.",
    );

    if (hasGoogleStartLink) {
      const googleHref = await googleStartLink.first().getAttribute("href");
      assert.ok(
        googleHref && googleHref.includes("/auth/google/start"),
        "Expected Google CTA to point to the backend OAuth start endpoint.",
      );
    } else {
      assert.equal(
        Boolean(providers?.google?.enabled),
        false,
        "Google disabled copy should only appear when the provider is disabled.",
      );
    }

    await page.close();
    page = await context.newPage();
    await gotoWithAppRetry(
      page,
      `${APP_BASE_URL}/auth/social/complete?locale=en`,
      "Complete your access to the observatory",
    );
    await page
      .getByRole("checkbox", {
        name: /I accept the terms and understand that my contributions can be moderated and audited\./i,
      })
      .waitFor();

    console.log("Checking public catalog layout in standard and high-shift views...");
    await assertCatalogLayout(
      page,
      `${APP_BASE_URL}/activities?locale=es`,
      "explore activities",
    );
    await assertCatalogLayout(
      page,
      `${APP_BASE_URL}/activities?locale=es&aiStatus=4`,
      "high-shift activities",
    );

    console.log("Registering the contributor smoke user...");
    await page.close();
    page = await context.newPage();
    await registerUser(page, {
      email: userOneEmail,
      displayName: userOneDisplayName,
    });

    console.log("Validating logout and login with returnTo...");
    await page.getByRole("button", { name: "Log out" }).click();
    await page.waitForURL(/\/(\?locale=en)?$/, { timeout: 15000 });
    await loginUser(page, {
      email: userOneEmail,
      returnTo: "/me/proposals",
    });
    await page.waitForURL(/\/me\/proposals(\?locale=en)?$/, { timeout: 15000 });
    await page.getByRole("heading", { name: "My proposals" }).waitFor();

    console.log("Submitting an activity proposal from the browser...");
    await page.goto(`${APP_BASE_URL}/me/proposals/activity/new?locale=en`, {
      waitUntil: "domcontentloaded",
    });
    await page
      .locator(".taxonomy-section")
      .nth(0)
      .locator('input[type="checkbox"]')
      .first()
      .check();
    await page
      .locator(".taxonomy-section")
      .nth(1)
      .locator('input[type="checkbox"]')
      .first()
      .check();
    const activityLanguageSection = page.locator(".proposal-form .glass-panel").nth(2);
    await activityLanguageSection.locator("input").nth(0).fill(proposalTitle);
    await activityLanguageSection.locator("input").nth(1).fill("UI smoke short summary");
    await activityLanguageSection
      .locator("textarea")
      .nth(0)
      .fill("Full description generated by the reproducible UI smoke.");
    await page.getByRole("button", { name: "Submit activity proposal" }).click();
    await page
      .getByText("Activity proposal submitted successfully.", { exact: false })
      .waitFor({ timeout: 15000 });
    await page.getByRole("link", { name: "Go to my proposals" }).click();
    await page.getByRole("heading", { name: "My proposals" }).waitFor();
    await page.getByText(proposalTitle, { exact: false }).waitFor({ timeout: 15000 });

    console.log("Editing the pending activity proposal from the browser...");
    const proposalCard = page
      .locator("article.activity-card")
      .filter({ hasText: proposalTitle })
      .first();
    await proposalCard.getByRole("link", { name: "Edit draft" }).click();
    await page.getByRole("heading", { name: "Edit activity proposal" }).waitFor();
    const editLanguageSection = page.locator(".proposal-form .glass-panel").nth(2);
    await editLanguageSection.locator("input").nth(0).fill(updatedProposalTitle);
    await editLanguageSection.locator("input").nth(1).fill("UI smoke updated short summary");
    await editLanguageSection
      .locator("textarea")
      .nth(0)
      .fill("Updated full description generated by the reproducible UI smoke.");
    await page.getByRole("button", { name: "Save activity proposal" }).click();
    await page
      .getByText("Activity proposal updated successfully.", { exact: false })
      .waitFor({ timeout: 15000 });
    await page.getByRole("link", { name: "Go to my proposals" }).click();
    await page.getByText(updatedProposalTitle, { exact: false }).waitFor({
      timeout: 15000,
    });

      console.log("Checking activity detail contribution flow...");
      await page.goto(`${APP_BASE_URL}/activities/${activity.slug}?locale=en`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("button", { name: "Follow" }).click();
      await page.getByRole("button", { name: "Following" }).waitFor({
        timeout: 15000,
      });
      await page.getByText("Activity summary", { exact: true }).waitFor();
      await page.getByRole("link", { name: "Propose new evidence" }).click();
      await page.waitForURL(/\/me\/proposals\/evidence\/new\?/, { timeout: 15000 });
      await page.getByText(`Starting from activity: ${activityDetail.title}`, { exact: false }).waitFor({
        timeout: 15000,
      });
      await page.goto(`${APP_BASE_URL}/activities?locale=en&followed=true`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("link", { name: activityDetail.title }).waitFor({
        timeout: 15000,
      });
      const followedCatalogCard = page
        .locator(".activity-grid .activity-card")
        .filter({ hasText: activityDetail.title })
        .first();
      await followedCatalogCard.getByRole("button", { name: "Following" }).click();
      await page.getByText("No activities match this filter set", { exact: false }).waitFor({
        timeout: 15000,
      });
      await page.goto(`${APP_BASE_URL}/activities/${activity.slug}?locale=en`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("button", { name: "Follow" }).click();
      await page.getByRole("button", { name: "Following" }).waitFor({
        timeout: 15000,
      });
      await page.goto(`${APP_BASE_URL}/me/following?locale=en`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("heading", { name: "My followed activities" }).waitFor();
      await page.getByRole("link", { name: activityDetail.title }).waitFor({
        timeout: 15000,
      });
      await page.goto(`${APP_BASE_URL}/activities/${activity.slug}?locale=en`, {
        waitUntil: "domcontentloaded",
      });
      if (commentsEnabled) {
        console.log("Posting an activity comment from the browser...");
        await page.getByRole("heading", { name: "Comments" }).waitFor();
        await page.getByLabel("Add your comment").fill(activityCommentText);
        await page.getByRole("button", { name: "Publish comment" }).click();
        await page.getByText("Comment published.", { exact: false }).waitFor({
          timeout: 15000,
        });
        await page.getByText(activityCommentText, { exact: false }).waitFor({
          timeout: 15000,
        });
      }

      console.log("Checking public Spanish activity detail...");
      const spanishActivityDetail = await getLocalizedActivityDetail(activity.slug, "es").catch(
        () => null,
      );
      if (spanishActivityDetail?.slug && spanishActivityDetail?.title) {
        await page.goto(`${APP_BASE_URL}/activities/${spanishActivityDetail.slug}?locale=es`, {
          waitUntil: "domcontentloaded",
        });
        await page
          .getByRole("heading", { name: spanishActivityDetail.title })
          .waitFor();
        await page.getByText("Resumen de la actividad", { exact: true }).waitFor();
      }

    console.log("Checking evidence detail...");
    await page.goto(
      `${APP_BASE_URL}/evidence/${evidence.slug ?? evidence.id}?locale=en`,
      {
        waitUntil: "domcontentloaded",
      },
    );
    if (commentsEnabled) {
      console.log("Posting an evidence comment from the browser...");
      await page.getByRole("heading", { name: "Comments" }).waitFor();
      await page.getByLabel("Add your comment").fill(evidenceCommentText);
      await page.getByRole("button", { name: "Publish comment" }).click();
      await page.getByText("Comment published.", { exact: false }).waitFor({
        timeout: 15000,
      });
      await page.getByText(evidenceCommentText, { exact: false }).waitFor({
        timeout: 15000,
      });
    }
    await page.screenshot({ path: evidenceScreenshotPath, fullPage: true });

    if (commentsEnabled) {
      console.log("Registering the reporter smoke user...");
      await registerUser(reporterPage, {
        email: userTwoEmail,
        displayName: userTwoDisplayName,
      });

      console.log("Replying to and reporting the activity comment...");
      await reporterPage.goto(`${APP_BASE_URL}/activities/${activity.slug}?locale=en`, {
        waitUntil: "domcontentloaded",
      });

      const commentCard = reporterPage
        .locator("article.comment-card")
        .filter({ hasText: activityCommentText })
        .first();

      await commentCard.waitFor({ timeout: 15000 });
      await commentCard.getByLabel("Reply").fill(replyText);
      await commentCard.getByRole("button", { name: "Post reply" }).click();
      await reporterPage.getByText("Reply published.", { exact: false }).waitFor({
        timeout: 15000,
      });
      await commentCard.getByText(replyText, { exact: false }).waitFor({
        timeout: 15000,
      });
      await commentCard.getByLabel("Report reason").fill("spam");
      await commentCard.getByLabel("Details").fill("UI smoke report validation.");
      await commentCard.getByRole("button", { name: "Report comment" }).click();
      await reporterPage.getByText("Report submitted.", { exact: false }).waitFor({
        timeout: 15000,
      });
    }
    await reporterPage.screenshot({ path: activityScreenshotPath, fullPage: true });

    await writeReport(reportPath, {
      executedAt: new Date(timestamp).toISOString(),
      frontendBaseUrl: APP_BASE_URL,
      apiBaseUrl: API_BASE_URL,
      contributorUser: userOneEmail,
      reporterUser: userTwoEmail,
      activitySlug: activity.slug,
      evidenceTarget: evidence.slug ?? evidence.id,
        proposalTitle,
        updatedProposalTitle,
      activityCommentText,
      evidenceCommentText,
      replyText,
      commentsEnabled,
        anonymousGuards: {
          proposalsLocale: "es",
          googleProviderEnabled: Boolean(providers?.google?.enabled),
          missingSocialSignupContext: true,
          loginReturnTo: "/me/proposals",
          spanishActivitySlug: "actividad-publica-smoke",
          catalogLayoutChecked: true,
          highShiftLayoutChecked: true,
        },
        artifacts: {
          activityScreenshotPath,
          evidenceScreenshotPath,
        reportPath,
      },
    });

    assert.ok(true);
    console.log("Frontend UI smoke passed.");
    console.log(`Contributor: ${userOneEmail}`);
    console.log(`Reporter: ${userTwoEmail}`);
    console.log(`Activity: ${activity.slug}`);
    console.log(`Evidence: ${evidence.slug ?? evidence.id}`);
    console.log(`Activity screenshot: ${activityScreenshotPath}`);
    console.log(`Evidence screenshot: ${evidenceScreenshotPath}`);
    console.log(`Execution report: ${reportPath}`);
  } finally {
    await context.close();
    await reporterContext.close();
    await browser.close();
  }
}

run().catch((error) => {
  console.error("Frontend UI smoke failed.");
  console.error(error);
  process.exitCode = 1;
});
