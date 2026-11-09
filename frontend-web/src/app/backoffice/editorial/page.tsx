import Link from "next/link";

import { BackofficeShell } from "@/components/backoffice-shell";
import { EditorialQueuePanel } from "@/components/editorial-queue-panel";
import { SiteShell } from "@/components/site-shell";
import { getEditorialActivities, getModerationQueue, getSessionUser } from "@/lib/api";
import { canAccessBackoffice, canEditEditorial } from "@/lib/access";
import {
  buildPath,
  formatAiStatus,
  formatEditorialStatus,
  localized,
  readParam,
  resolveLocale,
} from "@/lib/site";

type EditorialPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BackofficeEditorialPage({
  searchParams,
}: EditorialPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const status = readParam(params, "status") ?? "pending";
  const q = readParam(params, "q") ?? undefined;
  const hasEditorialSummary = readParam(params, "hasEditorialSummary") ?? undefined;
  const hasEvidence = readParam(params, "hasEvidence") ?? undefined;
  const officialAiStatus = readParam(params, "officialAiStatus") ?? undefined;
  const industry = readParam(params, "industry") ?? undefined;
  const category = readParam(params, "category") ?? undefined;
  const page = Number(readParam(params, "page") ?? "1");
  const user = await getSessionUser();

  if (!user || !canAccessBackoffice(user) || !canEditEditorial(user)) {
    return (
      <SiteShell locale={locale} wide>
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "Editorial review", es: "Revisi\u00f3n editorial" })}
          </span>
          <h1 className="section-title">
            {localized(locale, { en: "Editorial role required", es: "Se requiere rol editorial" })}
          </h1>
        </section>
      </SiteShell>
    );
  }

  const [queue, activities] = await Promise.all([
    getModerationQueue({ locale, type: "activities" }),
    getEditorialActivities({
      locale,
      status,
      q,
      hasEditorialSummary,
      hasEvidence,
      officialAiStatus,
      industry,
      category,
      page: Number.isFinite(page) && page > 0 ? page : 1,
    }),
  ]);

  return (
    <SiteShell locale={locale} wide>
      <BackofficeShell locale={locale} user={user} section="editorial" summary={queue?.summary}>
        <section className="glass-panel page-stack">
          <div className="section-header">
            <div>
              <span className="eyebrow">
                {localized(locale, { en: "Editorial review", es: "Revisi\u00f3n editorial" })}
              </span>
              <h1 className="section-title">
                {localized(locale, {
                  en: "Imported activities workspace",
                  es: "Workspace de actividades importadas",
                })}
              </h1>
              <p className="section-copy">
                {localized(locale, {
                  en: "Move through the imported seed in batches, enrich bilingual framing and publish only what is editorially ready.",
                  es: "Recorre el seed importado por tandas, completa el encuadre biling\u00fce y publica solo lo que ya est\u00e9 listo editorialmente.",
                })}
              </p>
            </div>
          </div>

          <div className="tab-row">
            {(["pending", "approved", "rejected", "needs_correction"] as const).map((value) => (
              <Link
                key={value}
                href={buildPath("/backoffice/editorial", locale, {
                  status: value,
                  q,
                  hasEditorialSummary,
                  hasEvidence,
                  officialAiStatus,
                  industry,
                  category,
                  page: "1",
                })}
                className={status === value ? "tab-chip tab-chip--active" : "tab-chip"}
              >
                {formatEditorialStatus(value, locale)}
              </Link>
            ))}
          </div>

          <form className="glass-panel page-stack" method="GET" action="/backoffice/editorial">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="status" value={status} />
            <div className="backoffice-filter-grid">
              <label className="comment-form">
                <span>{localized(locale, { en: "Search term", es: "B\u00fasqueda" })}</span>
                <input
                  type="search"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder={localized(locale, {
                    en: "Key, title, description or summary",
                    es: "Clave, t\u00edtulo, descripci\u00f3n o resumen",
                  })}
                />
              </label>
              <label className="comment-form">
                <span>{localized(locale, { en: "Summary", es: "Resumen" })}</span>
                <select name="hasEditorialSummary" defaultValue={hasEditorialSummary ?? ""}>
                  <option value="">{localized(locale, { en: "Any", es: "Cualquiera" })}</option>
                  <option value="true">{localized(locale, { en: "Ready", es: "Listo" })}</option>
                  <option value="false">{localized(locale, { en: "Missing", es: "Faltante" })}</option>
                </select>
              </label>
              <label className="comment-form">
                <span>{localized(locale, { en: "Evidence", es: "Evidencia" })}</span>
                <select name="hasEvidence" defaultValue={hasEvidence ?? ""}>
                  <option value="">{localized(locale, { en: "Any", es: "Cualquiera" })}</option>
                  <option value="true">{localized(locale, { en: "With evidence", es: "Con evidencia" })}</option>
                  <option value="false">{localized(locale, { en: "Without evidence", es: "Sin evidencia" })}</option>
                </select>
              </label>
            </div>
            <div className="backoffice-filter-grid">
              <label className="comment-form">
                <span>{localized(locale, { en: "Official AI status", es: "Estado IA oficial" })}</span>
                <select name="officialAiStatus" defaultValue={officialAiStatus ?? ""}>
                  <option value="">{localized(locale, { en: "Any", es: "Cualquiera" })}</option>
                  {["0", "1", "2", "3", "4", "5"].map((value) => (
                    <option key={value} value={value}>
                      {formatAiStatus(Number(value), locale)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="comment-form">
                <span>{localized(locale, { en: "Industry", es: "Industria" })}</span>
                <input
                  type="text"
                  name="industry"
                  defaultValue={industry ?? ""}
                  placeholder={localized(locale, {
                    en: "Key or name",
                    es: "Clave o nombre",
                  })}
                />
              </label>
              <label className="comment-form">
                <span>{localized(locale, { en: "Category", es: "Categor\u00eda" })}</span>
                <input
                  type="text"
                  name="category"
                  defaultValue={category ?? ""}
                  placeholder={localized(locale, {
                    en: "Key or name",
                    es: "Clave o nombre",
                  })}
                />
              </label>
            </div>
            <div className="action-row">
              <button type="submit" className="button button--solid">
                {localized(locale, { en: "Apply filters", es: "Aplicar filtros" })}
              </button>
              <Link
                href={buildPath("/backoffice/editorial", locale, { status, page: "1" })}
                className="button button--ghost"
              >
                {localized(locale, { en: "Reset", es: "Resetear" })}
              </Link>
            </div>
          </form>

          {activities ? (
            <EditorialQueuePanel
              locale={locale}
              activities={activities}
              currentFilters={{
                status,
                q,
                hasEditorialSummary,
                hasEvidence,
                officialAiStatus,
                industry,
                category,
              }}
            />
          ) : (
            <div className="empty-panel">
              <p>
                {localized(locale, {
                  en: "Editorial queue is unavailable right now.",
                  es: "La cola editorial no est\u00e1 disponible ahora mismo.",
                })}
              </p>
            </div>
          )}
        </section>
      </BackofficeShell>
    </SiteShell>
  );
}
