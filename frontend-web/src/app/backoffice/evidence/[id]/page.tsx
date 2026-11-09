import { BackofficeShell } from "@/components/backoffice-shell";
import { EvidenceAdminForm } from "@/components/evidence-admin-form";
import { SiteShell } from "@/components/site-shell";
import {
  getEditorialCatalogEvidenceDetail,
  getEditorialCatalogReferences,
  getModerationQueue,
  getSessionUser,
} from "@/lib/api";
import { canAccessBackoffice, canEditEditorial } from "@/lib/access";
import { localized, readParam, resolveLocale } from "@/lib/site";

type BackofficeEvidenceDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BackofficeEvidenceDetailPage({
  params,
  searchParams,
}: BackofficeEvidenceDetailPageProps) {
  const route = await params;
  const query = await searchParams;
  const locale = resolveLocale(readParam(query, "locale"));
  const user = await getSessionUser();

  if (!user || !canAccessBackoffice(user) || !canEditEditorial(user)) {
    return (
      <SiteShell locale={locale} wide>
        <section className="empty-panel page-stack">
          <h1 className="section-title">
            {localized(locale, { en: "Editorial role required", es: "Se requiere rol editorial" })}
          </h1>
        </section>
      </SiteShell>
    );
  }

  const [queue, references, evidence] = await Promise.all([
    getModerationQueue({ locale, type: "activities" }),
    getEditorialCatalogReferences(locale),
    getEditorialCatalogEvidenceDetail(route.id, locale),
  ]);

  if (!references || !evidence) {
    return (
      <SiteShell locale={locale} wide>
        <section className="empty-panel page-stack">
          <p>{localized(locale, { en: "Evidence not found.", es: "Evidencia no encontrada." })}</p>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell locale={locale} wide>
      <BackofficeShell locale={locale} user={user} section="evidence" summary={queue?.summary}>
        <EvidenceAdminForm locale={locale} mode="edit" references={references} initialData={evidence} />
      </BackofficeShell>
    </SiteShell>
  );
}
