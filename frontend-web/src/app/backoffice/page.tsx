import Link from "next/link";

import { BackofficeShell } from "@/components/backoffice-shell";
import { getContactMessages } from "@/lib/api";
import { PublicSettingsCard } from "@/components/public-settings-card";
import { SiteShell } from "@/components/site-shell";
import {
  getAdminPublicSettings,
  getModerationQueue,
  getSessionUser,
} from "@/lib/api";
import {
  canAccessBackoffice,
  canAdminister,
  canEditEditorial,
  canModerate,
} from "@/lib/access";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type BackofficePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BackofficePage({ searchParams }: BackofficePageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const user = await getSessionUser();

  if (!user) {
    return (
      <SiteShell locale={locale} wide>
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "Restricted area", es: "\u00c1rea restringida" })}
          </span>
          <h1 className="section-title">
            {localized(locale, {
              en: "Sign in to access backoffice",
              es: "Inicia sesi\u00f3n para acceder al backoffice",
            })}
          </h1>
          <p className="section-copy">
            {localized(locale, {
              en: "This workspace is only available to editorial or moderation roles.",
              es: "Este workspace solo est\u00e1 disponible para roles editoriales o de moderaci\u00f3n.",
            })}
          </p>
          <div className="profile-actions" style={{ justifyContent: "center" }}>
            <Link href={buildPath("/auth/login", locale, { returnTo: "/backoffice" })} className="button button--solid">
              {localized(locale, { en: "Log in", es: "Ingresar" })}
            </Link>
          </div>
        </section>
      </SiteShell>
    );
  }

  if (!canAccessBackoffice(user)) {
    return (
      <SiteShell locale={locale} wide>
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "Permissions", es: "Permisos" })}
          </span>
          <h1 className="section-title">
            {localized(locale, {
              en: "Your account has no backoffice role",
              es: "Tu cuenta no tiene rol de backoffice",
            })}
          </h1>
          <p className="section-copy">
            {localized(locale, {
              en: "Ask for an EDITOR, MODERATOR or ADMIN role to use these workflows.",
              es: "Solicita un rol EDITOR, MODERATOR o ADMIN para usar estos flujos.",
            })}
          </p>
        </section>
      </SiteShell>
    );
  }

  const [queue, publicSettings, contactInbox] = await Promise.all([
    getModerationQueue({
      locale,
      type: "activity_proposals",
    }),
    canAdminister(user) ? getAdminPublicSettings() : Promise.resolve(null),
    getContactMessages({ page: 1, pageSize: 1 }),
  ]);

  return (
    <SiteShell locale={locale} wide>
      <BackofficeShell locale={locale} user={user} section="overview" summary={queue?.summary}>
        <section className="glass-panel page-stack">
          <div>
            <span className="eyebrow">
              {localized(locale, { en: "Next actions", es: "Siguientes acciones" })}
            </span>
            <h1 className="section-title">
              {localized(locale, {
                en: "Choose an operational lane",
                es: "Eleg\u00ed una pista operativa",
              })}
            </h1>
          </div>

          <div className="queue-list">
            {canModerate(user) ? (
              <article className="backoffice-card">
                <div className="backoffice-card__header">
                  <div>
                    <h2>{localized(locale, { en: "Moderation queue", es: "Cola de moderaci\u00f3n" })}</h2>
                    <p>
                      {localized(locale, {
                        en: "Process community reports and submitted proposals with explicit reasons.",
                        es: "Procesa reportes de comunidad y propuestas enviadas con fundamentos expl\u00edcitos.",
                      })}
                    </p>
                  </div>
                  <span className="status-pill">{queue?.summary.reportedComments ?? 0}</span>
                </div>
                <Link href={buildPath("/backoffice/moderation", locale)} className="button button--solid">
                  {localized(locale, { en: "Open moderation", es: "Abrir moderaci\u00f3n" })}
                </Link>
              </article>
            ) : null}

            {canEditEditorial(user) ? (
              <article className="backoffice-card">
                <div className="backoffice-card__header">
                  <div>
                    <h2>{localized(locale, { en: "Editorial review", es: "Revisi\u00f3n editorial" })}</h2>
                    <p>
                      {localized(locale, {
                        en: "Complete bilingual summaries, official AI status and publication decisions for imported activities.",
                        es: "Completa res\u00famenes biling\u00fces, estado IA oficial y decisiones de publicaci\u00f3n para actividades importadas.",
                      })}
                    </p>
                  </div>
                  <span className="status-pill">{queue?.summary.pendingActivities ?? 0}</span>
                </div>
                <Link href={buildPath("/backoffice/editorial", locale)} className="button button--solid">
                  {localized(locale, { en: "Open editorial", es: "Abrir editorial" })}
                </Link>
              </article>
            ) : null}

            {canEditEditorial(user) ? (
              <article className="backoffice-card">
                <div className="backoffice-card__header">
                  <div>
                    <h2>{localized(locale, { en: "Activities", es: "Actividades" })}</h2>
                    <p>
                      {localized(locale, {
                        en: "Create, edit, archive and publish activities without touching the seed.",
                        es: "Crea, edita, archiva y publica actividades sin tocar el seed.",
                      })}
                    </p>
                  </div>
                </div>
                <Link href={buildPath("/backoffice/activities", locale)} className="button button--solid">
                  {localized(locale, { en: "Manage activities", es: "Gestionar actividades" })}
                </Link>
              </article>
            ) : null}

            {canEditEditorial(user) ? (
              <article className="backoffice-card">
                <div className="backoffice-card__header">
                  <div>
                    <h2>{localized(locale, { en: "Evidence", es: "Evidencias" })}</h2>
                    <p>
                      {localized(locale, {
                        en: "Create, edit and relate evidence items directly from backoffice.",
                        es: "Crea, edita y relaciona evidencias directamente desde backoffice.",
                      })}
                    </p>
                  </div>
                </div>
                <Link href={buildPath("/backoffice/evidence", locale)} className="button button--solid">
                  {localized(locale, { en: "Manage evidence", es: "Gestionar evidencias" })}
                </Link>
              </article>
            ) : null}

            {canAdminister(user) && publicSettings ? (
              <PublicSettingsCard locale={locale} settings={publicSettings} />
            ) : null}

            <article className="backoffice-card">
              <div className="backoffice-card__header">
                <div>
                  <h2>{localized(locale, { en: "Contact inbox", es: "Bandeja de contacto" })}</h2>
                  <p>
                    {localized(locale, {
                      en: "Review messages sent from the public contact form.",
                      es: "Revisá mensajes enviados desde el formulario público de contacto.",
                    })}
                  </p>
                </div>
                <span className="status-pill">{contactInbox?.summary.new ?? 0}</span>
              </div>
              <Link href={buildPath("/backoffice/contact", locale)} className="button button--solid">
                {localized(locale, { en: "Open inbox", es: "Abrir bandeja" })}
              </Link>
            </article>
          </div>
        </section>
      </BackofficeShell>
    </SiteShell>
  );
}
