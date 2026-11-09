import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentsSection } from "@/components/comments-section";
import { SiteShell } from "@/components/site-shell";
import { getEvidenceBySlug, getSessionUser } from "@/lib/api";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type EvidencePageProps = {
  params: Promise<{ idOrSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EvidencePage({
  params,
  searchParams,
}: EvidencePageProps) {
  const routeParams = await params;
  const queryParams = await searchParams;
  const locale = resolveLocale(readParam(queryParams, "locale"));
  const [evidence, user] = await Promise.all([
    getEvidenceBySlug(routeParams.idOrSlug, locale),
    getSessionUser(),
  ]);

  if (!evidence) {
    notFound();
  }

  return (
    <SiteShell locale={locale}>
      <div className="detail-grid">
        <section className="detail-panel page-stack">
          <div className="detail-copy">
            <span className="eyebrow">
              {localized(locale, { en: "Evidence detail", es: "Detalle de evidencia" })}
            </span>
            <h1>{evidence.title ?? evidence.type}</h1>
            <p>{evidence.summary ?? evidence.context}</p>
          </div>

          <div className="detail-tags">
            <span className="status-pill">{evidence.type}</span>
            {evidence.reliabilityFlag ? (
              <span className="tag-chip tag-chip--muted">{evidence.reliabilityFlag}</span>
            ) : null}
          </div>

          <div className="glass-panel page-stack">
            <span className="eyebrow">
              {localized(locale, { en: "Context", es: "Contexto" })}
            </span>
            <p>
              {evidence.context ??
                localized(locale, {
                  en: "No extended context is public yet.",
                  es: "Todavia no hay contexto extendido publico.",
                })}
            </p>
          </div>

          <div className="glass-panel page-stack">
            <span className="eyebrow">
              {localized(locale, { en: "Source", es: "Fuente" })}
            </span>
            <p>{evidence.sourceText ?? localized(locale, { en: "Source pending", es: "Fuente pendiente" })}</p>
            {evidence.sourceUrl ? (
              <a href={evidence.sourceUrl} target="_blank" rel="noreferrer" className="button button--ghost">
                {localized(locale, { en: "Open source", es: "Abrir fuente" })}
              </a>
            ) : null}
          </div>

          {evidence.publicFeatures.commentsEnabled ? (
            <CommentsSection
              locale={locale}
              user={user}
              entityKind="evidence"
              entityId={evidence.id}
              comments={evidence.comments}
            />
          ) : null}
        </section>

        <aside className="detail-sidebar">
          <div className="glass-panel page-stack">
            <span className="eyebrow">
              {localized(locale, { en: "Related activities", es: "Actividades relacionadas" })}
            </span>
            {evidence.activities.length > 0 ? (
              <div className="related-links">
                {evidence.activities.map((activity) => (
                  <Link
                    key={activity.id}
                    href={buildPath(`/activities/${activity.slug ?? activity.key}`, locale)}
                    className="related-link-card"
                  >
                    <span>{activity.title}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p>
                {localized(locale, {
                  en: "No public activity link is available yet.",
                  es: "Todavia no hay actividades publicas vinculadas.",
                })}
              </p>
            )}
          </div>

        </aside>
      </div>
    </SiteShell>
  );
}
