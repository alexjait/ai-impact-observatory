import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { readParam, resolveLocale, buildPath, localized } from "@/lib/site";

type RegisterSuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterSuccessPage({
  searchParams,
}: RegisterSuccessPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const returnTo = readParam(params, "returnTo");
  const email = readParam(params, "email");

  return (
    <SiteShell locale={locale}>
      <div className="auth-card auth-card--state">
        <div className="auth-state auth-state--success">
          <span className="auth-state__eyebrow">
            {localized(locale, {
              en: "Registration complete",
              es: "Registro completado",
            })}
          </span>
          <h1>
            {localized(locale, {
              en: "Check your email",
              es: "Revisá tu email",
            })}
          </h1>
          <p>
            {localized(locale, {
              en: "We sent you a verification link so you can activate your account before signing in.",
              es: "Te enviamos un enlace de verificación para que actives tu cuenta antes de ingresar.",
            })}
          </p>
          {email ? (
            <div className="auth-state__highlight">
              <strong>
                {localized(locale, {
                  en: "Verification email sent to",
                  es: "Email de verificación enviado a",
                })}
              </strong>
              <span>{email}</span>
            </div>
          ) : null}
          <div className="auth-state__steps">
            <p>
              {localized(locale, {
                en: "Open the email, click the verification link, and then come back to sign in.",
                es: "Abrí el email, hacé clic en el enlace de verificación y después volvé para ingresar.",
              })}
            </p>
          </div>
          <div className="auth-state__actions">
            <Link
              href={buildPath("/auth/login", locale, { returnTo })}
              className="button button--solid"
            >
              {localized(locale, {
                en: "Go to login",
                es: "Ir al login",
              })}
            </Link>
            <Link
              href={buildPath("/auth/register", locale, { returnTo })}
              className="button button--ghost"
            >
              {localized(locale, {
                en: "Use another email",
                es: "Usar otro email",
              })}
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
