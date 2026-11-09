import { BackofficeShell } from "@/components/backoffice-shell";
import { ModerationQueuePanel } from "@/components/moderation-queue-panel";
import { SiteShell } from "@/components/site-shell";
import { getModerationQueue, getSessionUser, type ModerationQueueType } from "@/lib/api";
import { canAccessBackoffice, canModerate } from "@/lib/access";
import { localized, readParam, resolveLocale } from "@/lib/site";

type ModerationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BackofficeModerationPage({
  searchParams,
}: ModerationPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const type = (readParam(params, "type") as ModerationQueueType | undefined) ?? "activity_proposals";
  const status = readParam(params, "status");
  const q = readParam(params, "q") ?? undefined;
  const page = Number(readParam(params, "page") ?? "1");
  const user = await getSessionUser();

  if (!user || !canAccessBackoffice(user) || !canModerate(user)) {
    return (
      <SiteShell locale={locale} wide>
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "Moderation", es: "Moderaci\u00f3n" })}
          </span>
          <h1 className="section-title">
            {localized(locale, { en: "Moderation role required", es: "Se requiere rol de moderaci\u00f3n" })}
          </h1>
        </section>
      </SiteShell>
    );
  }

  const queue = await getModerationQueue({
    locale,
    type,
    status,
    q,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  });

  return (
    <SiteShell locale={locale} wide>
      <BackofficeShell locale={locale} user={user} section="moderation" summary={queue?.summary}>
        {queue ? (
          <ModerationQueuePanel
            locale={locale}
            queue={queue}
            editorialPath="/backoffice/editorial/activities"
            currentStatus={status}
            currentQuery={q}
          />
        ) : (
          <section className="empty-panel page-stack">
            <span className="eyebrow">
              {localized(locale, { en: "Moderation queue", es: "Cola de moderaci\u00f3n" })}
            </span>
            <h1 className="section-title">
              {localized(locale, { en: "Queue unavailable", es: "Cola no disponible" })}
            </h1>
          </section>
        )}
      </BackofficeShell>
    </SiteShell>
  );
}
