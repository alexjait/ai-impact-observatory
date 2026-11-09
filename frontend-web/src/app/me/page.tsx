import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { SiteShell } from "@/components/site-shell";
import { getSessionUser } from "@/lib/api";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type MePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MePage({ searchParams }: MePageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const user = await getSessionUser();

  return (
    <SiteShell locale={locale}>
      {user ? (
        <section className="profile-panel">
          <span className="eyebrow">
            {localized(locale, { en: "Authenticated profile", es: "Perfil autenticado" })}
          </span>
          <h1>{user.displayName}</h1>
          <p>{user.email}</p>

          <div className="profile-chips">
            {user.roles.map((role) => (
              <span key={role} className="tag-chip">
                {role}
              </span>
            ))}
            {user.authMethods.map((method) => (
              <span key={method} className="tag-chip tag-chip--muted">
                {method}
              </span>
            ))}
          </div>

          <ul className="muted-list">
            <li>
              {localized(locale, { en: "Session id", es: "Id de sesión" })}: {user.sessionId}
            </li>
            <li>
              {localized(locale, {
                en: "Local password enabled",
                es: "Password local habilitada",
              })}
              :{" "}
              {user.hasLocalPassword
                ? localized(locale, { en: "yes", es: "sí" })
                : localized(locale, { en: "no", es: "no" })}
            </li>
          </ul>

          <div className="profile-actions">
            <Link href={buildPath("/activities", locale)} className="button button--solid">
              {localized(locale, { en: "Browse activities", es: "Explorar actividades" })}
            </Link>
            <Link href={buildPath("/me/following", locale)} className="button button--ghost">
              {localized(locale, { en: "My followed activities", es: "Mis actividades seguidas" })}
            </Link>
            <Link href={buildPath("/me/proposals", locale)} className="button button--ghost">
              {localized(locale, { en: "My proposals", es: "Mis propuestas" })}
            </Link>
            <LogoutButton
              redirectPath={buildPath("/", locale)}
              label={localized(locale, { en: "Log out", es: "Salir" })}
            />
          </div>
        </section>
      ) : (
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "No active session", es: "Sin sesión activa" })}
          </span>
          <h1 className="section-title">
            {localized(locale, { en: "You are not logged in yet", es: "Todavía no iniciaste sesión" })}
          </h1>
          <p className="section-copy">
            {localized(locale, {
              en: "The profile screen is already wired to the backend session cookie. Sign in from the auth flow to validate it end to end.",
              es: "La pantalla de perfil ya está conectada a la cookie de sesión backend. Inicia sesión desde auth para validarla end to end.",
            })}
          </p>
          <div className="profile-actions" style={{ justifyContent: "center" }}>
            <Link href={buildPath("/auth/login", locale, { returnTo: "/me" })} className="button button--solid">
              {localized(locale, { en: "Log in", es: "Ingresar" })}
            </Link>
            <Link href={buildPath("/auth/register", locale, { returnTo: "/me" })} className="button button--ghost">
              {localized(locale, { en: "Register", es: "Crear cuenta" })}
            </Link>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
