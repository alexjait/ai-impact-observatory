import Link from "next/link";

import { ActivityCard } from "@/components/activity-card";
import { SiteShell } from "@/components/site-shell";
import { getFollowedActivities, getSessionUser } from "@/lib/api";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type FollowingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FollowingPage({ searchParams }: FollowingPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const [user, activities] = await Promise.all([
    getSessionUser(),
    getFollowedActivities(locale),
  ]);

  return (
    <SiteShell locale={locale}>
      {user ? (
        <section className="page-stack">
          <div className="catalog-header">
            <div>
              <span className="eyebrow">
                {localized(locale, {
                  en: "Personal tracking",
                  es: "Seguimiento personal",
                })}
              </span>
              <h1 className="section-title">
                {localized(locale, {
                  en: "My followed activities",
                  es: "Mis actividades seguidas",
                })}
              </h1>
              <p className="section-copy">
                {localized(locale, {
                  en: "Keep an eye on the activities you care about, even if some are no longer public in the catalog.",
                  es: "Seguí de cerca las actividades que te importan, incluso si alguna deja de estar pública en el catálogo.",
                })}
              </p>
            </div>
            <div className="catalog-actions">
              <Link href={buildPath("/activities", locale, { followed: "true" })} className="button button--ghost">
                {localized(locale, {
                  en: "Open filtered catalog",
                  es: "Abrir catálogo filtrado",
                })}
              </Link>
            </div>
          </div>

          {activities && activities.length > 0 ? (
            <div className="activity-grid">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  locale={locale}
                  isAuthenticated
                />
              ))}
            </div>
          ) : (
            <div className="empty-panel">
              <h2 className="section-title">
                {localized(locale, {
                  en: "You are not following any activities yet",
                  es: "Todavía no seguís ninguna actividad",
                })}
              </h2>
              <p className="section-copy">
                {localized(locale, {
                  en: "Use the catalog or activity detail pages to start building your own shortlist.",
                  es: "Usá el catálogo o el detalle de actividad para armar tu propia selección.",
                })}
              </p>
              <Link href={buildPath("/activities", locale)} className="button button--solid">
                {localized(locale, {
                  en: "Explore activities",
                  es: "Explorar actividades",
                })}
              </Link>
            </div>
          )}
        </section>
      ) : (
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "No active session", es: "Sin sesión activa" })}
          </span>
          <h1 className="section-title">
            {localized(locale, {
              en: "Log in to keep track of activities",
              es: "Ingresá para seguir actividades",
            })}
          </h1>
          <p className="section-copy">
            {localized(locale, {
              en: "Following is private and tied to your account, so you need an active session first.",
              es: "El seguimiento es privado y queda asociado a tu cuenta, así que primero necesitás una sesión activa.",
            })}
          </p>
          <div className="profile-actions" style={{ justifyContent: "center" }}>
            <Link href={buildPath("/auth/login", locale, { returnTo: "/me/following" })} className="button button--solid">
              {localized(locale, { en: "Log in", es: "Ingresar" })}
            </Link>
            <Link href={buildPath("/auth/register", locale, { returnTo: "/me/following" })} className="button button--ghost">
              {localized(locale, { en: "Register", es: "Crear cuenta" })}
            </Link>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
