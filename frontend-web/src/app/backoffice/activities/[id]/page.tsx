import { ActivityAdminForm } from "@/components/activity-admin-form";
import { BackofficeShell } from "@/components/backoffice-shell";
import { SiteShell } from "@/components/site-shell";
import {
  getEditorialCatalogActivityDetail,
  getEditorialCatalogReferences,
  getModerationQueue,
  getSessionUser,
} from "@/lib/api";
import { canAccessBackoffice, canEditEditorial } from "@/lib/access";
import { localized, readParam, resolveLocale } from "@/lib/site";

type BackofficeActivityDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BackofficeActivityDetailPage({
  params,
  searchParams,
}: BackofficeActivityDetailPageProps) {
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

  const [queue, references, activity] = await Promise.all([
    getModerationQueue({ locale, type: "activities" }),
    getEditorialCatalogReferences(locale),
    getEditorialCatalogActivityDetail(route.id, locale),
  ]);

  if (!references || !activity) {
    return (
      <SiteShell locale={locale} wide>
        <section className="empty-panel page-stack">
          <p>{localized(locale, { en: "Activity not found.", es: "Actividad no encontrada." })}</p>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell locale={locale} wide>
      <BackofficeShell locale={locale} user={user} section="activities" summary={queue?.summary}>
        <ActivityAdminForm locale={locale} mode="edit" references={references} initialData={activity} />
      </BackofficeShell>
    </SiteShell>
  );
}
