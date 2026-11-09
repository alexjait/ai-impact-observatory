const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { createHash } = require('crypto');
const { AuthProvider, PrismaClient } = require('@prisma/client');

const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
const baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/v1`;
const prisma = new PrismaClient();

function hashToken(value) {
  return createHash('sha256').update(value).digest('hex');
}

function extractCookie(headers) {
  const setCookies = typeof headers.getSetCookie === 'function'
    ? headers.getSetCookie()
    : [];

  const sessionCookie = setCookies.find((cookie) =>
    cookie.startsWith(`${process.env.SESSION_COOKIE_NAME || 'aiio_session'}=`),
  );

  if (!sessionCookie) {
    return null;
  }

  return sessionCookie.split(';')[0];
}

async function expectOkJson(response, context) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${context} failed with ${response.status}: ${text}`);
  }

  return data;
}

async function main() {
  const runId = Date.now();
  const email = `smoke.auth.${runId}@example.test`;
  const password = 'SmokeTest123!';
  const newPassword = 'SmokeReset456!';
  const displayName = `Smoke ${runId}`;
  const socialEmail = `smoke.social.${runId}@example.test`;

  console.log(`Using API base: ${baseUrl}`);
  console.log(`Smoke user: ${email}`);

  const providersResponse = await fetch(`${baseUrl}/auth/providers`);
  const providers = await expectOkJson(providersResponse, 'providers');
  if (!providers?.local?.enabled) {
    throw new Error('Local auth provider is not enabled.');
  }
  console.log('Providers check passed.');

  const registerResponse = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      displayName,
      termsAccepted: true,
    }),
  });
  const registerBody = await expectOkJson(registerResponse, 'register');
  const registerCookie = extractCookie(registerResponse.headers);
  if (!registerCookie) {
    throw new Error('Register did not return a session cookie.');
  }
  console.log('Register passed.');

  const meAfterRegisterResponse = await fetch(`${baseUrl}/me`, {
    headers: {
      Cookie: registerCookie,
    },
  });
  const meAfterRegister = await expectOkJson(meAfterRegisterResponse, 'me after register');
  if (meAfterRegister.email !== email) {
    throw new Error('Authenticated profile after register does not match created user.');
  }
  if (!Array.isArray(meAfterRegister.authMethods) || !meAfterRegister.authMethods.includes('local')) {
    throw new Error('Authenticated profile after register is missing local auth method.');
  }
  console.log('Profile after register passed.');

  const logoutResponse = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    headers: {
      Cookie: registerCookie,
    },
  });
  if (logoutResponse.status !== 204) {
    const text = await logoutResponse.text();
    throw new Error(`logout failed with ${logoutResponse.status}: ${text}`);
  }
  console.log('Logout passed.');

  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  const loginBody = await expectOkJson(loginResponse, 'login');
  const loginCookie = extractCookie(loginResponse.headers);
  if (!loginCookie) {
    throw new Error('Login did not return a session cookie.');
  }
  console.log('Login passed.');

  const meAfterLoginResponse = await fetch(`${baseUrl}/me`, {
    headers: {
      Cookie: loginCookie,
    },
  });
  const meAfterLogin = await expectOkJson(meAfterLoginResponse, 'me after login');
  if (meAfterLogin.email !== email) {
    throw new Error('Authenticated profile after login does not match expected user.');
  }
  if (meAfterLogin.hasLocalPassword !== true) {
    throw new Error('Authenticated profile after login should report local password availability.');
  }
  console.log('Profile after login passed.');

  const passwordResetTokensBeforeForgot = await prisma.passwordResetToken.count({
    where: { userId: registerBody.user.id },
  });

  const forgotResponse = await fetch(`${baseUrl}/auth/password/forgot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  const forgotBody = await expectOkJson(forgotResponse, 'forgot password');
  if (!forgotBody?.accepted) {
    throw new Error('Forgot password did not return accepted=true.');
  }
  console.log('Forgot password passed.');

  const passwordResetTokensAfterForgot = await prisma.passwordResetToken.count({
    where: { userId: registerBody.user.id },
  });
  if (passwordResetTokensAfterForgot <= passwordResetTokensBeforeForgot) {
    throw new Error('Forgot password did not create a reset token for a local account.');
  }
  console.log('Forgot password persistence passed.');

  const localIdentity = await prisma.authIdentity.findUnique({
    where: {
      provider_email: {
        provider: AuthProvider.local,
        email,
      },
    },
  });
  if (!localIdentity) {
    throw new Error('Local identity was not found for password reset smoke.');
  }

  const manualResetToken = `smoke-reset-${runId}`;
  await prisma.passwordResetToken.create({
    data: {
      userId: localIdentity.userId,
      authIdentityId: localIdentity.id,
      tokenHash: hashToken(manualResetToken),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  const resetResponse = await fetch(`${baseUrl}/auth/password/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: manualResetToken,
      newPassword,
    }),
  });
  const resetBody = await expectOkJson(resetResponse, 'reset password');
  if (!resetBody?.success) {
    throw new Error('Reset password did not return success=true.');
  }
  console.log('Reset password passed.');

  const meWithOldSessionResponse = await fetch(`${baseUrl}/me`, {
    headers: {
      Cookie: loginCookie,
    },
  });
  if (meWithOldSessionResponse.status === 200) {
    throw new Error('Reset password should invalidate previously issued sessions.');
  }
  console.log('Session invalidation after reset passed.');

  const oldPasswordLoginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  if (oldPasswordLoginResponse.status === 200) {
    throw new Error('Old password should no longer authenticate after reset.');
  }
  console.log('Old password rejection passed.');

  const newPasswordLoginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password: newPassword,
    }),
  });
  const newPasswordLoginBody = await expectOkJson(newPasswordLoginResponse, 'login with new password');
  const newPasswordCookie = extractCookie(newPasswordLoginResponse.headers);
  if (!newPasswordCookie) {
    throw new Error('Login with new password did not return a session cookie.');
  }
  if (!newPasswordLoginBody?.user?.id || newPasswordLoginBody.user.email !== email) {
    throw new Error('Login with new password did not return the expected user.');
  }
  console.log('New password login passed.');

  const socialUser = await prisma.user.create({
    data: {
      email: socialEmail,
      displayName: `Social ${runId}`,
    },
  });
  await prisma.authIdentity.create({
    data: {
      userId: socialUser.id,
      provider: AuthProvider.google,
      providerUserId: `google-${runId}`,
      email: socialEmail,
      displayNameSnapshot: `Social ${runId}`,
    },
  });

  const socialTokensBeforeForgot = await prisma.passwordResetToken.count({
    where: { userId: socialUser.id },
  });
  const socialForgotResponse = await fetch(`${baseUrl}/auth/password/forgot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: socialEmail }),
  });
  const socialForgotBody = await expectOkJson(socialForgotResponse, 'forgot password for social account');
  if (!socialForgotBody?.accepted) {
    throw new Error('Forgot password for a social-only account did not return accepted=true.');
  }
  const socialTokensAfterForgot = await prisma.passwordResetToken.count({
    where: { userId: socialUser.id },
  });
  if (socialTokensAfterForgot !== socialTokensBeforeForgot) {
    throw new Error('Social-only forgot password should not create reset tokens.');
  }
  console.log('Social-only forgot password guard passed.');

  if (!registerBody?.user?.id || registerBody.user.email !== email) {
    throw new Error('Register response body is missing expected user payload.');
  }

  if (!loginBody?.user?.id || loginBody.user.email !== email) {
    throw new Error('Login response body is missing expected user payload.');
  }

  console.log('Smoke auth local passed end to end.');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
