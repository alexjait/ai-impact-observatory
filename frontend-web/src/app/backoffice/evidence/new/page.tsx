import { BackofficeShell } from "@/components/backoffice-shell";
import { EvidenceAdminForm } from "@/components/evidence-admin-form";
import { SiteShell } from "@/components/site-shell";
import {
  getEditorialCatalogReferences,
  getModerationQueue,
  getSessionUser,
} from "@/lib/api";
import { canAccessBackoffice, canEditEditorial } from "@/lib/access";
import { localized, readParam, resolveLocale } from "@/lib/site";

type BackofficeNewEvidencePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BackofficeNewEvidencePage({
  searchParams,
}: BackofficeNewEvidencePageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
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

  const [queue, references] = await Promise.all([
    getModerationQueue({ locale, type: "activities" }),
    getEditorialCatalogReferences(locale),
  ]);

  if (!references) {
    return (
      <SiteShell locale={locale} wide>
        <section className="empty-panel page-stack">
          <p>{localized(locale, { en: "References unavailable.", es: "Referencias no disponibles." })}</p>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell locale={locale} wide>
      <BackofficeShell locale={locale} user={user} section="evidence" summary={queue?.summary}>
        <EvidenceAdminForm locale={locale} mode="create" references={references} />
      </BackofficeShell>
    </SiteShell>
  );
}
