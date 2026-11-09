import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type AuthConflictPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthConflictPage({
  searchParams,
}: AuthConflictPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const email = readParam(params, "email");
  const reason = readParam(params, "reason");
  const isGoogleConflict = reason === "google_email_conflict";

  return (
    <SiteShell locale={locale}>
      <section className="auth-card">
        <div className="auth-card__intro">
          <span className="eyebrow">
            {localized(locale, { en: "Account conflict", es: "Conflicto de cuenta" })}
          </span>
          <h1>
            {localized(locale, {
              en: "This email is already linked to another sign-in method",
              es: "Este email ya está vinculado a otro método de ingreso",
            })}
          </h1>
          <p>
            {localized(locale, {
              en: "For security, the MVP does not automatically merge accounts just because the email matches.",
              es: "Por seguridad, el MVP no fusiona cuentas automáticamente solo porque coincida el email.",
            })}
          </p>
        </div>

        <div className="glass-panel">
          <p>
            <strong>Email:</strong> {email ?? "unknown"}
          </p>
          <p>
            {isGoogleConflict
              ? localized(locale, {
                  en: "This email already has a password-based account. Please sign in with your existing email and password.",
                  es: "Este email ya tiene una cuenta con contraseña. Ingresá con tu email y contraseña existentes.",
                })
              : localized(locale, {
                  en: "Use the sign-in method you already used for this email.",
                  es: "Usá el método de ingreso que ya venías usando con este email.",
                })}
          </p>
          <p>
            {localized(locale, {
              en: "If you created the account with Google, continue with Google. If you created it with password, use login with password.",
              es: "Si creaste la cuenta con Google, continuá con Google. Si la creaste con contraseña, ingresá con contraseña.",
            })}
          </p>
        </div>

        <div className="page-stack">
          <Link href={buildPath("/auth/login", locale)} className="button button--solid button--block">
            {localized(locale, { en: "Go to login", es: "Ir al login" })}
          </Link>
          <Link href={buildPath("/auth/register", locale)} className="button button--ghost button--block">
            {localized(locale, { en: "Back to register", es: "Volver al registro" })}
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
