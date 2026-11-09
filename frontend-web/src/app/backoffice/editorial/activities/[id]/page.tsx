import Link from "next/link";

import { BackofficeShell } from "@/components/backoffice-shell";
import { EditorialActivityWorkspace } from "@/components/editorial-activity-workspace";
import { SiteShell } from "@/components/site-shell";
import {
  getEditorialActivityDetail,
  getModerationQueue,
  getSessionUser,
} from "@/lib/api";
import { canAccessBackoffice, canEditEditorial } from "@/lib/access";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type EditorialActivityPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditorialActivityPage({
  params,
  searchParams,
}: EditorialActivityPageProps) {
  const routeParams = await params;
  const query = await searchParams;
  const locale = resolveLocale(readParam(query, "locale"));
  const status = readParam(query, "status");
  const q = readParam(query, "q");
  const hasEditorialSummary = readParam(query, "hasEditorialSummary");
  const hasEvidence = readParam(query, "hasEvidence");
  const officialAiStatus = readParam(query, "officialAiStatus");
  const industry = readParam(query, "industry");
  const category = readParam(query, "category");
  const page = readParam(query, "page");
  const user = await getSessionUser();

  if (!user || !canAccessBackoffice(user) || !canEditEditorial(user)) {
    return (
      <SiteShell locale={locale} wide>
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "Editorial review", es: "Revisión editorial" })}
          </span>
          <h1 className="section-title">
            {localized(locale, { en: "Editorial role required", es: "Se requiere rol editorial" })}
          </h1>
        </section>
      </SiteShell>
    );
  }

  const [queue, activity] = await Promise.all([
    getModerationQueue({ locale, type: "activities" }),
    getEditorialActivityDetail(routeParams.id, locale, status ?? undefined),
  ]);

  const editorialListQuery = {
    status,
    q,
    hasEditorialSummary,
    hasEvidence,
    officialAiStatus,
    industry,
    category,
    page,
  };

  return (
    <SiteShell locale={locale} wide>
      <BackofficeShell locale={locale} user={user} section="editorial" summary={queue?.summary}>
        {activity ? (
          <div className="page-stack">
            <Link
              href={buildPath("/backoffice/editorial", locale, editorialListQuery)}
              className="button button--ghost backoffice-backlink"
            >
              {localized(locale, { en: "Back to editorial queue", es: "Volver a la cola editorial" })}
            </Link>
            <EditorialActivityWorkspace
              locale={locale}
              activity={activity}
              listQuery={editorialListQuery}
            />
          </div>
        ) : (
          <section className="empty-panel page-stack">
            <span className="eyebrow">
              {localized(locale, { en: "Editorial activity", es: "Actividad editorial" })}
            </span>
            <h1 className="section-title">
              {localized(locale, { en: "Activity not found", es: "Actividad no encontrada" })}
            </h1>
          </section>
        )}
      </BackofficeShell>
    </SiteShell>
  );
}
