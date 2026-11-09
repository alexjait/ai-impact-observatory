"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { TurnstileWidget, getCaptchaRequiredMessage } from "@/components/turnstile-widget";
import { resolveAuthErrorMessage } from "@/lib/auth-errors";
import { type Locale, buildPath, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

const PASSWORD_REQUIREMENTS = {
  en: "Minimum 8 characters, including uppercase, lowercase, and number.",
  es: "Minimo 8 caracteres, incluyendo mayuscula, minuscula y numero.",
} as const;

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

type ResetPasswordFormProps = {
  locale: Locale;
  initialToken?: string;
};

export function ResetPasswordForm({
  locale,
  initialToken,
}: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordMeetsComplexity = PASSWORD_COMPLEXITY_REGEX.test(newPassword);
  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;
  const hasResetToken = Boolean(initialToken?.trim());

  const handleCaptchaTokenChange = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!hasResetToken) {
      setError(
        localized(locale, {
          en: "That reset link is invalid or incomplete.",
          es: "Ese enlace de recuperacion es invalido o esta incompleto.",
        }),
      );
      return;
    }

    if (!passwordMeetsComplexity) {
      setError(localized(locale, PASSWORD_REQUIREMENTS));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        localized(locale, {
          en: "Passwords must match before you can continue.",
          es: "Las contrasenas deben coincidir para continuar.",
        }),
      );
      return;
    }

    if (!captchaToken) {
      setError(getCaptchaRequiredMessage(locale));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: initialToken, newPassword, captchaToken }),
      });

      if (!response.ok) {
        throw new Error(
          await resolveAuthErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "We could not update your password.",
              es: "No pudimos actualizar tu contrasena.",
            }),
          ),
        );
      }

      setMessage(
        localized(locale, {
          en: "Your password was updated successfully. You can now sign in with the new one.",
          es: "Tu contrasena se actualizo correctamente. Ya puedes ingresar con la nueva.",
        }),
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected password update error.",
              es: "Error inesperado al actualizar la contrasena.",
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
            en: "Create a new password",
            es: "Crear una nueva contrasena",
          })}
        </span>
        <h1>
          {localized(locale, {
            en: "Reset your password",
            es: "Restablecer contrasena",
          })}
        </h1>
        <p>
          {localized(locale, {
            en: "Choose a new password to recover access to your account.",
            es: "Elige una nueva contrasena para recuperar el acceso a tu cuenta.",
          })}
        </p>
      </div>

      {message ? (
        <div className="auth-state auth-state--success">
          <span className="auth-state__eyebrow">
            {localized(locale, {
              en: "Password updated",
              es: "Contrasena actualizada",
            })}
          </span>
          <h2>
            {localized(locale, {
              en: "You can sign in again",
              es: "Ya puedes volver a ingresar",
            })}
          </h2>
          <p>{message}</p>
          <div className="auth-state__actions">
            <Link href={buildPath("/auth/login", locale)} className="button button--solid">
              {localized(locale, { en: "Go to login", es: "Ir al login" })}
            </Link>
          </div>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          {!hasResetToken ? (
            <div className="auth-banner auth-banner--error">
              <strong>
                {localized(locale, {
                  en: "Reset link not valid",
                  es: "Enlace de recuperacion no valido",
                })}
              </strong>
              <p>
                {localized(locale, {
                  en: "Request a new password reset email and try again.",
                  es: "Solicita un nuevo email de recuperacion y vuelve a intentarlo.",
                })}
              </p>
            </div>
          ) : null}

          <label>
            <span>{localized(locale, { en: "New password", es: "Nueva contrasena" })}</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
              aria-invalid={newPassword.length > 0 && !passwordMeetsComplexity}
            />
            <span className="field-help">{localized(locale, PASSWORD_REQUIREMENTS)}</span>
          </label>

          <label>
            <span>{localized(locale, { en: "Confirm password", es: "Confirmar contrasena" })}</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              autoComplete="new-password"
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

          <TurnstileWidget
            locale={locale}
            action="reset_password"
            onTokenChange={handleCaptchaTokenChange}
            resetTrigger={captchaResetTrigger}
          />

          {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

          <button
            type="submit"
            className="button button--solid button--block"
            disabled={
              isSubmitting ||
              !hasResetToken ||
              !passwordMeetsComplexity ||
              !passwordsMatch ||
              !captchaToken
            }
          >
            {isSubmitting
              ? localized(locale, { en: "Updating...", es: "Actualizando..." })
              : localized(locale, {
                  en: "Update password",
                  es: "Actualizar contrasena",
                })}
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
