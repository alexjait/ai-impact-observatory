import Link from "next/link";

import { type ProposalInbox } from "@/lib/api";
import {
  type Locale,
  buildPath,
  formatEditorialStatus,
  localized,
} from "@/lib/site";

type ProposalsOverviewProps = {
  locale: Locale;
  inbox: ProposalInbox;
};

function ProposalList({
  items,
  emptyText,
  locale,
  kind,
}: {
  items: Array<{ id: string; title: string; status: string; createdAt: string }>;
  emptyText: string;
  locale: Locale;
  kind: "activity" | "evidence";
}) {
  const isEditable = (status: string) =>
    status === "pending" || status === "needs_correction";

  if (!items.length) {
    return <p className="section-copy">{emptyText}</p>;
  }

  return (
    <div className="proposal-list">
      {items.map((item) => (
        <article key={item.id} className="activity-card">
          <div className="activity-card__meta">
            <span className="status-pill">
              {formatEditorialStatus(item.status, locale)}
            </span>
            <span className="activity-card__granularity">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3>{item.title}</h3>
          <div className="profile-actions">
            {isEditable(item.status) ? (
              <Link
                href={buildPath(`/me/proposals/${kind}/${item.id}/edit`, locale)}
                className="button button--ghost"
              >
                {localized(locale, {
                  en: item.status === "needs_correction" ? "Apply correction" : "Edit draft",
                  es: item.status === "needs_correction" ? "Aplicar corrección" : "Editar borrador",
                })}
              </Link>
            ) : (
              <span className="section-copy">
                {localized(locale, {
                  en: "Locked after moderation review",
                  es: "Bloqueada tras revisión de moderación",
                })}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProposalsOverview({ locale, inbox }: ProposalsOverviewProps) {
  return (
    <div className="page-stack">
      <section className="profile-panel">
        <span className="eyebrow">
          {localized(locale, { en: "Private area", es: "Area privada" })}
        </span>
        <h1>
          {localized(locale, { en: "My proposals", es: "Mis propuestas" })}
        </h1>
        <p>
          {inbox.backendAvailable
            ? localized(locale, {
                en: "This inbox already reads your real contribution history, including the current moderation status of each proposal.",
                es: "Esta bandeja ya lee tu historial real de contribuciones, incluido el estado de moderación actual de cada propuesta.",
              })
            : localized(locale, {
                en: "The contribution UI is ready. The inbox will populate once backend proposal endpoints are enabled.",
                es: "La UI de contribución ya está lista. La bandeja se poblará cuando se habiliten los endpoints backend de propuestas.",
              })}
        </p>

        <div className="profile-actions">
          <Link href={buildPath("/me/proposals/activity/new", locale)} className="button button--solid">
            {localized(locale, { en: "New activity", es: "Nueva actividad" })}
          </Link>
          <Link href={buildPath("/me/proposals/evidence/new", locale)} className="button button--ghost">
            {localized(locale, { en: "New evidence", es: "Nueva evidencia" })}
          </Link>
        </div>
      </section>

      <section className="proposal-columns">
        <div className="glass-panel page-stack proposal-column">
          <div>
            <span className="eyebrow">
              {localized(locale, { en: "Activities", es: "Actividades" })}
            </span>
            <h2>{localized(locale, { en: "Activity proposals", es: "Propuestas de actividad" })}</h2>
          </div>
          <ProposalList
            items={inbox.activityProposals}
            locale={locale}
            kind="activity"
            emptyText={localized(locale, {
              en: "You have not submitted any activity proposals yet.",
              es: "Todavia no enviaste propuestas de actividad.",
            })}
          />
        </div>

        <div className="glass-panel page-stack proposal-column">
          <div>
            <span className="eyebrow">
              {localized(locale, { en: "Evidence", es: "Evidencia" })}
            </span>
            <h2>{localized(locale, { en: "Evidence proposals", es: "Propuestas de evidencia" })}</h2>
          </div>
          <ProposalList
            items={inbox.evidenceProposals}
            locale={locale}
            kind="evidence"
            emptyText={localized(locale, {
              en: "You have not submitted any evidence proposals yet.",
              es: "Todavia no enviaste propuestas de evidencia.",
            })}
          />
        </div>
      </section>
    </div>
  );
}
