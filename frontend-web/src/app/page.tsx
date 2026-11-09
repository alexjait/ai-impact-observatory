import Link from "next/link";

import { ActivityCard } from "@/components/activity-card";
import { SiteShell } from "@/components/site-shell";
import { getActivities, getMethodology, getSessionUser } from "@/lib/api";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const [activityResponse, methodology, user] = await Promise.all([
    getActivities({ locale, pageSize: 6 }),
    getMethodology(locale),
    getSessionUser(),
  ]);
  const highlightedActivities = activityResponse.items;

  return (
    <SiteShell locale={locale}>
      <div className="page-stack">
        <section className="hero-panel">
          <div>
            <span className="eyebrow">
              {localized(locale, {
                en: "Living map of AI impact",
                es: "Mapa vivo del impacto de la IA",
              })}
            </span>
            <h1>
              {localized(locale, {
                en: "See where AI is already reshaping real work.",
                es: "Mirá dónde ya está cambiando la IA el trabajo real.",
              })}
            </h1>
            <p>
              {localized(locale, {
                en: "Browse activities, review evidence, and add observations without losing track of what is confirmed and what is still emerging.",
                es: "Explora actividades, revisa evidencia y suma observaciones sin perder de vista qué está confirmado y qué todavía está en desarrollo.",
              })}
            </p>
            <div className="hero-panel__actions">
              <Link href={buildPath("/activities", locale)} className="button button--solid">
                {localized(locale, { en: "Explore activities", es: "Explorar actividades" })}
              </Link>
              {user ? (
                <Link href={buildPath("/me/proposals", locale)} className="button button--ghost">
                  {localized(locale, { en: "My proposals", es: "Mis propuestas" })}
                </Link>
              ) : (
                <Link href={buildPath("/auth/register", locale)} className="button button--ghost">
                  {localized(locale, { en: "Join the project", es: "Sumarte al proyecto" })}
                </Link>
              )}
            </div>
          </div>

          <div className="hero-highlights">
            <span className="eyebrow">
              {localized(locale, {
                en: "Start here",
                es: "Para empezar",
              })}
            </span>
            <div className="hero-point">
              <strong>
                {localized(locale, {
                  en: "Concrete activities",
                  es: "Actividades concretas",
                })}
              </strong>
              <span>
                {localized(locale, {
                  en: "Use the catalog to see where AI is entering everyday work.",
                  es: "Usa el catálogo para ver dónde la IA ya está entrando en el trabajo cotidiano.",
                })}
              </span>
            </div>
            <div className="hero-point">
              <strong>
                {localized(locale, {
                  en: "Evidence first",
                  es: "Evidencia primero",
                })}
              </strong>
              <span>
                {localized(locale, {
                  en: "Each activity can grow with sources, links, and context before becoming a stronger signal.",
                  es: "Cada actividad puede crecer con fuentes, enlaces y contexto antes de volverse una señal más sólida.",
                })}
              </span>
            </div>
            <div className="hero-point">
              <strong>
                {localized(locale, {
                  en: "Open contributions",
                  es: "Aportes abiertos",
                })}
              </strong>
              <span>
                {localized(locale, {
                  en: "Community signals and new evidence help the catalog stay close to real practice.",
                  es: "Las señales de la comunidad y la nueva evidencia ayudan a que el catálogo se mantenga cerca de la práctica real.",
                })}
              </span>
            </div>
          </div>
        </section>

        <section className="glass-panel page-stack">
          <div className="section-header">
            <div>
              <span className="eyebrow">
                {localized(locale, { en: "How to read it", es: "Cómo leerlo" })}
              </span>
              <h2 className="section-title">
                {localized(locale, {
                  en: "A simple scale for uneven change",
                  es: "Una escala simple para cambios desparejos",
                })}
              </h2>
            </div>
            <Link href={buildPath("/methodology", locale)} className="button button--ghost">
              {localized(locale, { en: "Read methodology", es: "Leer metodología" })}
            </Link>
          </div>

          <div className="grid-three">
            {methodology.levels.map((item) => (
              <div key={item.value} className="metric-card">
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="page-stack">
          <div className="section-header">
            <div>
              <span className="eyebrow">
                {localized(locale, { en: "Catalog", es: "Catálogo" })}
              </span>
              <h2 className="section-title">
                {localized(locale, {
                  en: "Featured activities",
                  es: "Actividades destacadas",
                })}
              </h2>
            </div>
            <Link href={buildPath("/activities", locale)} className="button button--ghost">
              {localized(locale, { en: "View all", es: "Ver todas" })}
            </Link>
          </div>

          {highlightedActivities.length > 0 ? (
            <div className="activity-grid">
              {highlightedActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  locale={locale}
                  isAuthenticated={Boolean(user)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-panel">
              <h2 className="section-title">
                {localized(locale, {
                  en: "The first public set is on its way",
                  es: "La primera tanda pública está en camino",
                })}
              </h2>
              <p className="section-copy">
                {localized(locale, {
                  en: "We are currently curating and verifying the first set of activities. Check back soon.",
                  es: "Estamos curando y verificando la primera tanda de actividades. Volvé a revisar pronto.",
                })}
              </p>
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
