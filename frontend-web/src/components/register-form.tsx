"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { TurnstileWidget, getCaptchaRequiredMessage } from "@/components/turnstile-widget";
import { type Providers } from "@/lib/api";
import { resolveAuthErrorMessage } from "@/lib/auth-errors";
import { type Locale, buildPath, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

const PASSWORD_REQUIREMENTS = {
  en: "Minimum 8 characters, including uppercase, lowercase, and number.",
  es: "Minimo 8 caracteres, incluyendo mayuscula, minuscula y numero.",
} as const;

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

type RegisterFormProps = {
  locale: Locale;
  providers: Providers;
  returnTo?: string;
};

export function RegisterForm({
  locale,
  providers,
  returnTo,
}: RegisterFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fallbackPath =
    returnTo && returnTo.startsWith("/") ? returnTo : buildPath("/me", locale);
  const googleHref = `${API_BASE_URL}/auth/google/start?returnTo=${encodeURIComponent(
    fallbackPath,
  )}`;
  const passwordMeetsComplexity = PASSWORD_COMPLEXITY_REGEX.test(password);
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;
  const canSubmit =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    passwordMeetsComplexity &&
    passwordsMatch &&
    Boolean(captchaToken) &&
    termsAccepted &&
    !isSubmitting;

  const handleCaptchaTokenChange = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(
        localized(locale, {
          en: "Passwords do not match.",
          es: "Las contrasenas no coinciden.",
        }),
      );
      return;
    }

    if (!passwordMeetsComplexity) {
      setError(localized(locale, PASSWORD_REQUIREMENTS));
      return;
    }

    if (!captchaToken) {
      setError(getCaptchaRequiredMessage(locale));
      return;
    }

    setIsSubmitting(true);

    try {
      const submittedEmail = email.trim();
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          email,
          captchaToken,
          locale,
          password,
          termsAccepted,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await resolveAuthErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "Could not create the account.",
              es: "No se pudo crear la cuenta.",
            }),
          ),
        );
      }

      setDisplayName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setTermsAccepted(false);
      router.push(
        buildPath("/auth/register/success", locale, {
          returnTo,
          email: submittedEmail,
        }),
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected registration error.",
              es: "Error inesperado de registro.",
            }),
      );
    } finally {
      setCaptchaToken(null);
      setCaptchaResetTrigger((current) => current + 1);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card__intro">
        <span className="eyebrow">
          {localized(locale, {
            en: "Contribute with traceability",
            es: "Contribui con trazabilidad",
          })}
        </span>
        <h1>{localized(locale, { en: "Create your account", es: "Crear cuenta" })}</h1>
        <p>
          {localized(locale, {
            en: "Comment, propose activities, and keep an auditable identity from day one.",
            es: "Comenta, propone actividades y manten una identidad auditable desde el primer dia.",
          })}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>{localized(locale, { en: "Display name", es: "Nombre visible" })}</span>
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="name"
            required
          />
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          <span>{localized(locale, { en: "Password", es: "Contrasena" })}</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={password.length > 0 && !passwordMeetsComplexity}
          />
          <span className="field-help">{localized(locale, PASSWORD_REQUIREMENTS)}</span>
        </label>

        <label>
          <span>
            {localized(locale, {
              en: "Confirm password",
              es: "Confirmar contrasena",
            })}
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
          />
        </label>

        {confirmPassword.length > 0 && !passwordsMatch ? (
          <p className="form-feedback form-feedback--error">
            {localized(locale, {
              en: "Passwords must match before you can continue.",
              es: "Las contrasenas deben coincidir para continuar.",
            })}
          </p>
        ) : null}

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
            required
          />
          <span>
            {localized(locale, {
              en: "I accept the terms for a transparent, accountable contribution flow.",
              es: "Acepto los terminos para un flujo de contribucion transparente y auditable.",
            })}
          </span>
        </label>

        <TurnstileWidget
          locale={locale}
          action="register"
          onTokenChange={handleCaptchaTokenChange}
          resetTrigger={captchaResetTrigger}
        />

        {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

        <button
          type="submit"
          className="button button--solid button--block"
          disabled={!canSubmit}
        >
          {isSubmitting
            ? localized(locale, { en: "Creating account...", es: "Creando cuenta..." })
            : localized(locale, { en: "Create account", es: "Crear cuenta" })}
        </button>
      </form>

      <div className="auth-divider">
        <span>{localized(locale, { en: "or start with", es: "o comenzar con" })}</span>
      </div>

      <a
        href={providers.google.enabled ? googleHref : undefined}
        aria-disabled={!providers.google.enabled}
        className={`button button--ghost button--block ${
          providers.google.enabled ? "" : "is-disabled"
        }`.trim()}
      >
        {localized(locale, { en: "Google", es: "Google" })}
      </a>

      <p className="auth-card__footer">
        {localized(locale, { en: "Already registered?", es: "Ya tienes cuenta?" })}{" "}
        <Link href={buildPath("/auth/login", locale, { returnTo })}>
          {localized(locale, { en: "Log in here", es: "Ingresa aca" })}
        </Link>
      </p>
    </div>
  );
}
