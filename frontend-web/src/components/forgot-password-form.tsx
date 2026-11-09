"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { TurnstileWidget, getCaptchaRequiredMessage } from "@/components/turnstile-widget";
import { resolveAuthErrorMessage } from "@/lib/auth-errors";
import { type Locale, buildPath, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

type ForgotPasswordFormProps = {
  locale: Locale;
};

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCaptchaTokenChange = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!captchaToken) {
      setError(getCaptchaRequiredMessage(locale));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, captchaToken }),
      });

      if (!response.ok) {
        throw new Error(
          await resolveAuthErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "We could not start password recovery.",
              es: "No se pudo iniciar la recuperacion de contrasena.",
            }),
          ),
        );
      }

      setMessage(
        localized(locale, {
          en: "If we find an account for that email, we will send instructions to recover access.",
          es: "Si encontramos una cuenta asociada a ese email, te vamos a enviar instrucciones para recuperar el acceso.",
        }),
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected recovery error.",
              es: "Error inesperado al recuperar la contrasena.",
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
          {localized(locale, { en: "Recover password", es: "Recuperar contrasena" })}
        </span>
        <h1>
          {localized(locale, {
            en: "Recover your password",
            es: "Recuperar contrasena",
          })}
        </h1>
        <p>
          {localized(locale, {
            en: "Enter your email to receive instructions.",
            es: "Ingresa tu email para recibir instrucciones.",
          })}
        </p>
      </div>

      {message ? (
        <div className="auth-state auth-state--success">
          <span className="auth-state__eyebrow">
            {localized(locale, {
              en: "Request received",
              es: "Solicitud recibida",
            })}
          </span>
          <h2>
            {localized(locale, {
              en: "Check your email",
              es: "Revisa tu email",
            })}
          </h2>
          <p>{message}</p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>{localized(locale, { en: "Email", es: "Correo electronico" })}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <TurnstileWidget
            locale={locale}
            action="forgot_password"
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
              ? localized(locale, { en: "Sending...", es: "Enviando..." })
              : localized(locale, { en: "Send link", es: "Enviar enlace" })}
          </button>
        </form>
      )}

      <p className="auth-card__footer">
        <Link href={buildPath("/auth/login", locale)}>
          {localized(locale, { en: "Cancel and go back", es: "Cancelar y volver" })}
        </Link>
      </p>
    </div>
  );
}
