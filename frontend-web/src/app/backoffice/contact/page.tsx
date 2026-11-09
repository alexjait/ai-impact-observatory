import Link from "next/link";

import { BackofficeShell } from "@/components/backoffice-shell";
import { ContactInboxPanel } from "@/components/contact-inbox-panel";
import { SiteShell } from "@/components/site-shell";
import { getContactMessages, getModerationQueue, getSessionUser } from "@/lib/api";
import { canAccessBackoffice } from "@/lib/access";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type BackofficeContactPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BackofficeContactPage({
  searchParams,
}: BackofficeContactPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const status = readParam(params, "status") ?? undefined;
  const q = readParam(params, "q") ?? undefined;
  const page = Number(readParam(params, "page") ?? "1");
  const user = await getSessionUser();

  if (!user || !canAccessBackoffice(user)) {
    return (
      <SiteShell locale={locale} wide>
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "Restricted area", es: "Área restringida" })}
          </span>
          <h1 className="section-title">
            {localized(locale, {
              en: "Backoffice role required",
              es: "Se requiere rol de backoffice",
            })}
          </h1>
          <p className="section-copy">
            {localized(locale, {
              en: "This inbox is only available to backoffice roles.",
              es: "Esta bandeja solo está disponible para roles de backoffice.",
            })}
          </p>
          <div className="profile-actions" style={{ justifyContent: "center" }}>
            <Link
              href={buildPath("/auth/login", locale, { returnTo: "/backoffice/contact" })}
              className="button button--solid"
            >
              {localized(locale, { en: "Log in", es: "Ingresar" })}
            </Link>
          </div>
        </section>
      </SiteShell>
    );
  }

  const [queue, inbox] = await Promise.all([
    getModerationQueue({ locale, type: "activity_proposals" }),
    getContactMessages({
      status,
      q,
      page: Number.isFinite(page) && page > 0 ? page : 1,
    }),
  ]);

  return (
    <SiteShell locale={locale} wide>
      <BackofficeShell locale={locale} user={user} section="contact" summary={queue?.summary}>
        <section className="glass-panel page-stack">
          <div className="section-header">
            <div>
              <span className="eyebrow">
                {localized(locale, { en: "Contact inbox", es: "Bandeja de contacto" })}
              </span>
              <h1 className="section-title">
                {localized(locale, {
                  en: "Messages sent from the site",
                  es: "Mensajes enviados desde el sitio",
                })}
              </h1>
              <p className="section-copy">
                {localized(locale, {
                  en: "Review incoming messages, identify who wrote, and keep a minimal operational status.",
                  es: "Revisá mensajes entrantes, identificá quién escribió y mantené un estado operativo mínimo.",
                })}
              </p>
            </div>
          </div>

          <form className="glass-panel page-stack" method="GET" action="/backoffice/contact">
            <input type="hidden" name="locale" value={locale} />
            <div className="backoffice-filter-grid">
              <label className="comment-form">
                <span>{localized(locale, { en: "Search term", es: "Búsqueda" })}</span>
                <input
                  type="search"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder={localized(locale, {
                    en: "Name, email, subject or message",
                    es: "Nombre, email, asunto o mensaje",
                  })}
                />
              </label>
              <label className="comment-form">
                <span>{localized(locale, { en: "Status", es: "Estado" })}</span>
                <select name="status" defaultValue={status ?? ""}>
                  <option value="">{localized(locale, { en: "Any", es: "Cualquiera" })}</option>
                  <option value="new">{localized(locale, { en: "New", es: "Nuevo" })}</option>
                  <option value="read">{localized(locale, { en: "Read", es: "Leído" })}</option>
                  <option value="archived">
                    {localized(locale, { en: "Archived", es: "Archivado" })}
                  </option>
                </select>
              </label>
            </div>
            <div className="action-row">
              <button type="submit" className="button button--solid">
                {localized(locale, { en: "Apply filters", es: "Aplicar filtros" })}
              </button>
              <Link
                href={buildPath("/backoffice/contact", locale, { page: "1" })}
                className="button button--ghost"
              >
                {localized(locale, { en: "Reset", es: "Resetear" })}
              </Link>
            </div>
          </form>

          {inbox ? <ContactInboxPanel locale={locale} inbox={inbox} /> : null}
        </section>
      </BackofficeShell>
    </SiteShell>
  );
}
