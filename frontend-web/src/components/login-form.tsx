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

type LoginFormProps = {
  locale: Locale;
  providers: Providers;
  returnTo?: string;
  emailVerification?: string;
};

export function LoginForm({
  locale,
  providers,
  returnTo,
  emailVerification,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fallbackPath =
    returnTo && returnTo.startsWith("/") ? returnTo : buildPath("/me", locale);
  const googleHref = `${API_BASE_URL}/auth/google/start?returnTo=${encodeURIComponent(
    fallbackPath,
  )}`;
  const verificationMessage =
    emailVerification === "success"
      ? {
          title: localized(locale, {
            en: "Email verified",
            es: "Email verificado",
          }),
          body: localized(locale, {
            en: "Your account is active now. Sign in to enter the portal.",
            es: "Tu cuenta ya esta activa. Ingresa para entrar al portal.",
          }),
          tone: "success" as const,
        }
      : emailVerification === "invalid"
        ? {
            title: localized(locale, {
              en: "Verification link not valid",
              es: "Enlace de verificacion no valido",
            }),
            body: localized(locale, {
              en: "That verification link is invalid or expired.",
              es: "Ese enlace de verificacion es invalido o vencio.",
            }),
            tone: "error" as const,
          }
        : null;

  const handleCaptchaTokenChange = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError(getCaptchaRequiredMessage(locale));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }),
      });

      if (!response.ok) {
        throw new Error(
          await resolveAuthErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "Could not sign in with those credentials.",
              es: "No se pudo iniciar sesion con esas credenciales.",
            }),
          ),
        );
      }

      router.push(fallbackPath);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected authentication error.",
              es: "Error inesperado de autenticacion.",
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
          {localized(locale, { en: "Account access", es: "Acceso a cuenta" })}
        </span>
        <h1>
          {localized(locale, {
            en: "Log into the observatory",
            es: "Ingresar al observatorio",
          })}
        </h1>
        <p>
          {localized(locale, {
            en: "Keep your place, contribute new evidence, and continue where you left off.",
            es: "Manten tu contexto, aporta nueva evidencia y retoma donde lo dejaste.",
          })}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {verificationMessage ? (
          <div className={`auth-banner auth-banner--${verificationMessage.tone}`}>
            <strong>{verificationMessage.title}</strong>
            <p>{verificationMessage.body}</p>
          </div>
        ) : null}

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
            autoComplete="current-password"
            required
          />
        </label>

        <TurnstileWidget
          locale={locale}
          action="login"
          onTokenChange={handleCaptchaTokenChange}
          resetTrigger={captchaResetTrigger}
        />

        {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

        <button
          type="submit"
          className="button button--solid button--block"
          disabled={isSubmitting || !captchaToken}
        >
          {isSubmitting
            ? localized(locale, { en: "Signing in...", es: "Ingresando..." })
            : localized(locale, { en: "Log in", es: "Ingresar" })}
        </button>
      </form>

      <p className="auth-card__footer">
        <Link href={buildPath("/auth/forgot-password", locale)}>
          {localized(locale, {
            en: "Forgot your password?",
            es: "Olvidaste tu contrasena?",
          })}
        </Link>
      </p>

      <div className="auth-divider">
        <span>{localized(locale, { en: "or continue with", es: "o continuar con" })}</span>
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

      {!providers.google.enabled ? (
        <p className="form-feedback">
          {localized(locale, {
            en: "Google sign-in is not configured yet in this environment.",
            es: "Google Sign-In todavia no esta configurado en este entorno.",
          })}
        </p>
      ) : null}

      <p className="auth-card__footer">
        {localized(locale, { en: "Need an account?", es: "Necesitas una cuenta?" })}{" "}
        <Link href={buildPath("/auth/register", locale, { returnTo })}>
          {localized(locale, { en: "Register here", es: "Creala aca" })}
        </Link>
      </p>
    </div>
  );
}
