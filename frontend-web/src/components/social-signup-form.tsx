"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { resolveAuthErrorMessage } from "@/lib/auth-errors";
import { buildPath, type Locale, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

type SocialSignupFormProps = {
  locale: Locale;
};

export function SocialSignupForm({ locale }: SocialSignupFormProps) {
  const router = useRouter();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/social/complete-signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termsAccepted }),
      });

      if (!response.ok) {
        throw new Error(
          await resolveAuthErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "Could not finish social signup.",
              es: "No se pudo completar el alta social.",
            }),
          ),
        );
      }

      const payload = (await response.json()) as { returnTo?: string };
      router.push(
        payload.returnTo && payload.returnTo.startsWith("/")
          ? payload.returnTo
          : buildPath("/me", locale),
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected social signup error.",
              es: "Error inesperado de alta social.",
            }),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card__intro">
        <span className="eyebrow">
          {localized(locale, { en: "Google identity", es: "Identidad Google" })}
        </span>
        <h1>
          {localized(locale, {
            en: "Complete your access to the observatory",
            es: "Completa tu acceso al observatorio",
          })}
        </h1>
        <p>
          {localized(locale, {
            en: "We already recognized your Google account. We just need terms acceptance before opening the collaborative tools.",
            es: "Ya reconocimos tu cuenta de Google. Solo falta aceptar terminos antes de habilitar las herramientas colaborativas.",
          })}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
            required
          />
          <span>
            {localized(locale, {
              en: "I accept the terms and understand that my contributions can be moderated and audited.",
              es: "Acepto los terminos y entiendo que mis aportes pueden ser moderados y auditados.",
            })}
          </span>
        </label>

        {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

        <button type="submit" className="button button--solid button--block" disabled={isSubmitting}>
          {isSubmitting
            ? localized(locale, { en: "Finishing signup...", es: "Completando alta..." })
            : localized(locale, { en: "Finish signup", es: "Completar alta" })}
        </button>
      </form>
    </div>
  );
}
