import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentsSection } from "@/components/comments-section";
import { FollowToggleButton } from "@/components/follow-toggle-button";
import { SiteShell } from "@/components/site-shell";
import { getActivityBySlug, getSessionUser } from "@/lib/api";
import {
  buildPath,
  formatAiStatus,
  formatDate,
  localized,
  readParam,
  resolveLocale,
} from "@/lib/site";

type ActivityDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ActivityDetailPage({
  params,
  searchParams,
}: ActivityDetailPageProps) {
  const routeParams = await params;
  const queryParams = await searchParams;
  const locale = resolveLocale(readParam(queryParams, "locale"));
  const [activity, user] = await Promise.all([
    getActivityBySlug(routeParams.slug, locale),
    getSessionUser(),
  ]);

  if (!activity) {
    notFound();
  }

  const detailNarrative =
    activity.fullDescription ?? activity.shortDescription ?? activity.editorialSummary;
  const publicSummary =
    activity.editorialSummary && activity.editorialSummary !== detailNarrative
      ? activity.editorialSummary
      : null;

  return (
    <SiteShell locale={locale}>
      <div className="detail-grid detail-grid--single">
        <section className="detail-panel page-stack">
          <div className="detail-copy">
            <span className="eyebrow">
              {localized(locale, { en: "Activity detail", es: "Detalle de actividad" })}
            </span>
            <h1>{activity.title}</h1>
            {detailNarrative ? <p>{detailNarrative}</p> : null}
          </div>

          <div className="detail-tags">
            <span className="status-pill">
              {formatAiStatus(activity.officialAiStatus, locale)}
            </span>
            {activity.industries.map((industry) => (
              <span key={industry.key} className="tag-chip">
                {industry.name}
              </span>
            ))}
            {activity.categories.map((category) => (
              <span key={category.key} className="tag-chip tag-chip--muted">
                {category.name}
              </span>
            ))}
          </div>

          <div className="detail-actions">
            {user ? (
              <FollowToggleButton
                activityId={activity.id}
                locale={locale}
                initialIsFollowing={activity.isFollowing}
              />
            ) : (
              <Link
                href={buildPath("/auth/login", locale, {
                  returnTo: buildPath(`/activities/${activity.slug}`, locale),
                })}
                className="button button--ghost"
              >
                {localized(locale, {
                  en: "Log in to follow",
                  es: "Ingresar para seguir",
                })}
              </Link>
            )}
          </div>

          {publicSummary ? (
            <div className="glass-panel">
              <span className="eyebrow">
                {localized(locale, { en: "Activity summary", es: "Resumen de la actividad" })}
              </span>
              <p>{publicSummary}</p>
            </div>
          ) : null}

          {user ? (
            <div className="glass-panel page-stack">
              <div>
                <span className="eyebrow">
                  {localized(locale, { en: "Contribute", es: "Contribuir" })}
                </span>
                <h2>
                  {localized(locale, {
                    en: "Add evidence to this activity",
                    es: "Sumar evidencia a esta actividad",
                  })}
                </h2>
              </div>
              <p>
                {localized(locale, {
                  en: "If you know a source, report, or concrete case related to this activity, send it straight into the review flow.",
                  es: "Si conocés una fuente, reporte o caso concreto relacionado con esta actividad, podés enviarlo directo al flujo de revisión.",
                })}
              </p>
              <div className="profile-actions">
                <Link
                  href={buildPath("/me/proposals/evidence/new", locale, {
                    activityKey: activity.key,
                    activityTitle: activity.title,
                  })}
                  className="button button--solid"
                >
                  {localized(locale, {
                    en: "Propose new evidence",
                    es: "Proponer nueva evidencia",
                  })}
                </Link>
              </div>
            </div>
          ) : null}

          <div className="page-stack">
            <div className="section-header">
              <div>
                <span className="eyebrow">
                  {localized(locale, { en: "Evidence", es: "Evidencia" })}
                </span>
                <h2>{localized(locale, { en: "Approved evidence", es: "Evidencia aprobada" })}</h2>
              </div>
            </div>

            {activity.evidences.length > 0 ? (
              activity.evidences.map((evidence) => (
                <article key={evidence.id} className="activity-card">
                  <div className="activity-card__meta">
                    <span className="status-pill">{evidence.type}</span>
                    {evidence.eventDate ? (
                      <span className="tag-chip tag-chip--muted">
                        {localized(locale, { en: "Event", es: "Fecha" })}:{" "}
                        {formatDate(evidence.eventDate, locale)}
                      </span>
                    ) : null}
                    {evidence.showReliabilityWarning ? (
                      <span className="tag-chip tag-chip--muted">
                        {localized(locale, {
                          en: "Reliability warning",
                          es: "Advertencia de confiabilidad",
                        })}
                      </span>
                    ) : null}
                  </div>
                  <div className="activity-card__body">
                    <h3>
                      <Link href={buildPath(`/evidence/${evidence.slug ?? evidence.id}`, locale)}>
                        {evidence.title}
                      </Link>
                    </h3>
                    <p>{evidence.summary}</p>
                  </div>
                  {evidence.sourceUrl ? (
                    <a href={evidence.sourceUrl} target="_blank" rel="noreferrer" className="button button--ghost">
                      {localized(locale, { en: "Open source", es: "Abrir fuente" })}
                    </a>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="empty-panel">
                <p>
                  {localized(locale, {
                    en: "No approved evidence is public for this activity yet.",
                    es: "Todavía no hay evidencia aprobada pública para esta actividad.",
                  })}
                </p>
              </div>
            )}
          </div>

          {activity.publicFeatures.commentsEnabled ? (
            <CommentsSection
              locale={locale}
              user={user}
              entityKind="activity"
              entityId={activity.id}
              comments={activity.comments}
            />
          ) : (
            <section className="glass-panel page-stack">
              <div>
                <span className="eyebrow">
                  {localized(locale, { en: "Community", es: "Comunidad" })}
                </span>
                <h2>{localized(locale, { en: "How to contribute", es: "Cómo aportar" })}</h2>
              </div>
              <p>
                {localized(locale, {
                  en: "For now, public participation on this activity goes through new evidence proposals linked to the review flow.",
                  es: "Por ahora, la participación pública en esta actividad se canaliza mediante nuevas propuestas de evidencia vinculadas al flujo de revisión.",
                })}
              </p>
              <div className="profile-actions">
                <Link
                  href={buildPath("/me/proposals/evidence/new", locale, {
                    activityKey: activity.key,
                    activityTitle: activity.title,
                  })}
                  className="button button--solid"
                >
                  {localized(locale, {
                    en: "Propose new evidence",
                    es: "Proponer nueva evidencia",
                  })}
                </Link>
              </div>
            </section>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
