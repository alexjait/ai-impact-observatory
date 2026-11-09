import Link from "next/link";

import { type AuthenticatedUser, type ModerationQueueSummary } from "@/lib/api";
import { canEditEditorial, canModerate } from "@/lib/access";
import { type Locale, buildPath, localized } from "@/lib/site";

type BackofficeShellProps = {
  locale: Locale;
  user: AuthenticatedUser;
  section: "overview" | "moderation" | "editorial" | "activities" | "evidence" | "contact";
  summary?: ModerationQueueSummary | null;
  children: React.ReactNode;
};

export function BackofficeShell({
  locale,
  user,
  section,
  summary,
  children,
}: BackofficeShellProps) {
  const moderationEnabled = canModerate(user);
  const editorialEnabled = canEditEditorial(user);

  return (
    <div className="backoffice-layout">
      <aside className="backoffice-sidebar glass-panel">
        <div className="page-stack">
          <div>
            <span className="eyebrow">
              {localized(locale, { en: "Backoffice", es: "Backoffice" })}
            </span>
            <h2 className="section-title">
              {localized(locale, { en: "Editorial operations", es: "Operaci\u00f3n editorial" })}
            </h2>
            <p className="section-copy">
              {localized(locale, {
                en: "Review seed imports, proposals and community reports from one shared workspace.",
                es: "Revisa imports del seed, propuestas y reportes comunitarios desde un workspace compartido.",
              })}
            </p>
          </div>

          <nav className="backoffice-nav" aria-label="Backoffice">
            <Link
              href={buildPath("/backoffice", locale)}
              className={section === "overview" ? "is-active" : undefined}
            >
              {localized(locale, { en: "Overview", es: "Resumen" })}
            </Link>
            {moderationEnabled ? (
              <Link
                href={buildPath("/backoffice/moderation", locale)}
                className={section === "moderation" ? "is-active" : undefined}
              >
                {localized(locale, { en: "Moderation queue", es: "Cola de moderaci\u00f3n" })}
              </Link>
            ) : null}
            {editorialEnabled ? (
              <Link
                href={buildPath("/backoffice/editorial", locale)}
                className={section === "editorial" ? "is-active" : undefined}
              >
                {localized(locale, { en: "Editorial review", es: "Revisi\u00f3n editorial" })}
              </Link>
            ) : null}
            {editorialEnabled ? (
              <Link
                href={buildPath("/backoffice/activities", locale)}
                className={section === "activities" ? "is-active" : undefined}
              >
                {localized(locale, { en: "Activities", es: "Actividades" })}
              </Link>
            ) : null}
            {editorialEnabled ? (
              <Link
                href={buildPath("/backoffice/evidence", locale)}
                className={section === "evidence" ? "is-active" : undefined}
              >
                {localized(locale, { en: "Evidence", es: "Evidencias" })}
              </Link>
            ) : null}
            <Link
              href={buildPath("/backoffice/contact", locale)}
              className={section === "contact" ? "is-active" : undefined}
            >
              {localized(locale, { en: "Contact inbox", es: "Bandeja de contacto" })}
            </Link>
          </nav>

          <div className="backoffice-role-list">
            {user.roles.map((role) => (
              <span key={role} className="tag-chip">
                {role}
              </span>
            ))}
          </div>

          {summary ? (
            <div className="backoffice-summary">
              <div className="metric-card">
                <strong>{summary.pendingActivityProposals}</strong>
                <span>
                  {localized(locale, {
                    en: "activity proposals pending",
                    es: "propuestas de actividad pendientes",
                  })}
                </span>
              </div>
              <div className="metric-card">
                <strong>{summary.pendingEvidenceProposals}</strong>
                <span>
                  {localized(locale, {
                    en: "evidence proposals pending",
                    es: "propuestas de evidencia pendientes",
                  })}
                </span>
              </div>
              <div className="metric-card">
                <strong>{summary.reportedComments}</strong>
                <span>
                  {localized(locale, {
                    en: "reported comments",
                    es: "comentarios denunciados",
                  })}
                </span>
              </div>
              <div className="metric-card">
                <strong>{summary.pendingActivities}</strong>
                <span>
                  {localized(locale, {
                    en: "seed activities pending",
                    es: "actividades seed pendientes",
                  })}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="backoffice-content">{children}</div>
    </div>
  );
}
