import Link from "next/link";

import { BackofficeCatalogPagination } from "@/components/backoffice-catalog-pagination";
import { BackofficeShell } from "@/components/backoffice-shell";
import { SiteShell } from "@/components/site-shell";
import {
  getEditorialCatalogEvidence,
  getEditorialCatalogReferences,
  getModerationQueue,
  getSessionUser,
} from "@/lib/api";
import { canAccessBackoffice, canEditEditorial } from "@/lib/access";
import {
  buildPath,
  formatDate,
  formatEditorialStatus,
  localized,
  readParam,
  resolveLocale,
} from "@/lib/site";

type BackofficeEvidencePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BackofficeEvidencePage({
  searchParams,
}: BackofficeEvidencePageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const q = readParam(params, "q") ?? undefined;
  const status = readParam(params, "status") ?? undefined;
  const type = readParam(params, "type") ?? undefined;
  const activityId = readParam(params, "activityId") ?? undefined;
  const reliabilityFlag = readParam(params, "reliabilityFlag") ?? undefined;
  const page = Number(readParam(params, "page") ?? "1");
  const user = await getSessionUser();

  if (!user || !canAccessBackoffice(user) || !canEditEditorial(user)) {
    return (
      <SiteShell locale={locale} wide>
        <section className="empty-panel page-stack">
          <h1 className="section-title">
            {localized(locale, {
              en: "Editorial role required",
              es: "Se requiere rol editorial",
            })}
          </h1>
        </section>
      </SiteShell>
    );
  }

  const [queue, references, evidences] = await Promise.all([
    getModerationQueue({ locale, type: "activities" }),
    getEditorialCatalogReferences(locale),
    getEditorialCatalogEvidence({
      locale,
      q,
      status,
      type,
      activityId,
      reliabilityFlag,
      page: Number.isFinite(page) && page > 0 ? page : 1,
    }),
  ]);

  return (
    <SiteShell locale={locale} wide>
      <BackofficeShell locale={locale} user={user} section="evidence" summary={queue?.summary}>
        <section className="glass-panel page-stack">
          <div className="section-header">
            <div>
              <span className="eyebrow">
                {localized(locale, { en: "Evidence", es: "Evidencias" })}
              </span>
              <h1 className="section-title">
                {localized(locale, {
                  en: "Evidence catalog management",
                  es: "Gestión del catálogo de evidencias",
                })}
              </h1>
              <p className="section-copy">
                {localized(locale, {
                  en: "Manage public evidence records, keep their links with activities healthy and jump into editing from a single operational view.",
                  es: "Gestioná evidencias públicas, mantené sanos sus vínculos con actividades y entrá a editar desde una sola vista operativa.",
                })}
              </p>
            </div>
            <Link
              href={buildPath("/backoffice/evidence/new", locale)}
              className="button button--solid"
            >
              {localized(locale, { en: "New evidence", es: "Nueva evidencia" })}
            </Link>
          </div>

          <div className="admin-summary">
            <article className="admin-stat">
              <span className="eyebrow">
                {localized(locale, { en: "Results", es: "Resultados" })}
              </span>
              <strong>{evidences?.total ?? 0}</strong>
              <p>
                {localized(locale, {
                  en: "Evidence records matching the current filters.",
                  es: "Registros de evidencia que coinciden con los filtros actuales.",
                })}
              </p>
            </article>
            <article className="admin-stat">
              <span className="eyebrow">
                {localized(locale, { en: "Page", es: "Página" })}
              </span>
              <strong>
                {evidences?.page ?? 1}
                <span className="admin-stat__muted">
                  {" / "}
                  {Math.max(1, Math.ceil((evidences?.total ?? 0) / (evidences?.pageSize ?? 20)))}
                </span>
              </strong>
              <p>
                {localized(locale, {
                  en: "Each page shows up to 20 evidence items.",
                  es: "Cada página muestra hasta 20 evidencias.",
                })}
              </p>
            </article>
            <article className="admin-stat">
              <span className="eyebrow">
                {localized(locale, { en: "Order", es: "Orden" })}
              </span>
              <strong>
                {localized(locale, { en: "Most recent edits", es: "Ediciones más recientes" })}
              </strong>
              <p>
                {localized(locale, {
                  en: "The list is sorted by last update so the latest operational work stays at the top.",
                  es: "La lista se ordena por última actualización para que el trabajo operativo más reciente quede arriba.",
                })}
              </p>
            </article>
          </div>

          <form
            className="glass-panel admin-filter-panel page-stack"
            method="GET"
            action="/backoffice/evidence"
          >
            <input type="hidden" name="locale" value={locale} />
            <div className="admin-filter-panel__header">
              <div>
                <span className="eyebrow">
                  {localized(locale, { en: "Filters", es: "Filtros" })}
                </span>
                <h2>{localized(locale, { en: "Refine the list", es: "Afinar listado" })}</h2>
              </div>
              <p className="section-copy">
                {localized(locale, {
                  en: "Combine evidence metadata with a related activity filter to isolate the exact records you want to edit.",
                  es: "Combiná metadatos de evidencia con un filtro por actividad relacionada para aislar el conjunto exacto a editar.",
                })}
              </p>
            </div>
            <div className="admin-filter-grid">
              <label className="comment-form">
                <span>{localized(locale, { en: "Search", es: "Búsqueda" })}</span>
                <input
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder={localized(locale, {
                    en: "Title, source text or keyword",
                    es: "Título, fuente o palabra clave",
                  })}
                />
              </label>
              <label className="comment-form">
                <span>{localized(locale, { en: "Status", es: "Estado" })}</span>
                <select name="status" defaultValue={status ?? ""}>
                  <option value="">{localized(locale, { en: "Any", es: "Cualquiera" })}</option>
                  {["pending", "approved", "needs_correction", "rejected", "archived"].map((value) => (
                    <option key={value} value={value}>
                      {formatEditorialStatus(value, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="comment-form">
                <span>{localized(locale, { en: "Type", es: "Tipo" })}</span>
                <input
                  name="type"
                  defaultValue={type ?? ""}
                  placeholder={localized(locale, {
                    en: "article, report, official_source...",
                    es: "article, report, official_source...",
                  })}
                />
              </label>
              <label className="comment-form">
                <span>{localized(locale, { en: "Related activity", es: "Actividad relacionada" })}</span>
                <select name="activityId" defaultValue={activityId ?? ""}>
                  <option value="">
                    {localized(locale, { en: "Any activity", es: "Cualquier actividad" })}
                  </option>
                  {references?.activities.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="comment-form">
                <span>{localized(locale, { en: "Reliability", es: "Confiabilidad" })}</span>
                <select name="reliabilityFlag" defaultValue={reliabilityFlag ?? ""}>
                  <option value="">{localized(locale, { en: "Any", es: "Cualquiera" })}</option>
                  {["normal", "outdated", "low_confidence", "archived"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="action-row">
              <button type="submit" className="button button--solid">
                {localized(locale, { en: "Apply filters", es: "Aplicar filtros" })}
              </button>
              <Link href={buildPath("/backoffice/evidence", locale)} className="button button--ghost">
                {localized(locale, { en: "Reset", es: "Resetear" })}
              </Link>
            </div>
          </form>

          <section className="glass-panel admin-table-shell page-stack">
            <div className="admin-table-shell__header">
              <div>
                <span className="eyebrow">
                  {localized(locale, { en: "Catalog view", es: "Vista de catálogo" })}
                </span>
                <h2>{localized(locale, { en: "Evidence", es: "Evidencias" })}</h2>
              </div>
              <p className="section-copy">
                {localized(locale, {
                  en: "The table below represents the current page of evidence results, ordered by last update.",
                  es: "La tabla de abajo representa la página actual de evidencias, ordenada por última actualización.",
                })}
              </p>
            </div>

            {evidences?.items.length ? (
              <div className="admin-table-scroll">
                <div
                  className="admin-table admin-table--evidence"
                  role="table"
                  aria-label={localized(locale, {
                    en: "Evidence list",
                    es: "Listado de evidencias",
                  })}
                >
                <div className="admin-table__head" role="row">
                  <span>{localized(locale, { en: "Evidence", es: "Evidencia" })}</span>
                  <span>{localized(locale, { en: "Type and reliability", es: "Tipo y confiabilidad" })}</span>
                  <span>{localized(locale, { en: "Editorial state", es: "Estado editorial" })}</span>
                  <span>{localized(locale, { en: "Related activities", es: "Actividades relacionadas" })}</span>
                  <span>{localized(locale, { en: "Updated", es: "Actualizado" })}</span>
                  <span>{localized(locale, { en: "Actions", es: "Acciones" })}</span>
                </div>
                {evidences.items.map((item) => (
                  <article key={item.id} className="admin-table__row" role="row">
                    <div className="admin-table__cell admin-table__cell--primary">
                      <strong>{item.title}</strong>
                      <span>{item.key ?? item.type}</span>
                    </div>
                    <div className="admin-table__cell">
                      <div className="detail-tags">
                        <span className="tag-chip">{item.type}</span>
                        <span className="tag-chip tag-chip--muted">
                          {item.reliabilityFlag ?? "normal"}
                        </span>
                      </div>
                    </div>
                    <div className="admin-table__cell">
                      <span className="status-pill">
                        {formatEditorialStatus(item.editorialStatus, locale)}
                      </span>
                    </div>
                    <div className="admin-table__cell">
                      <strong>{item.activityCount}</strong>
                      <span className="admin-table__meta">
                        {item.activityTitles.join(" · ") || "—"}
                      </span>
                    </div>
                    <div className="admin-table__cell">
                      <span>{formatDate(item.updatedAt, locale) ?? "—"}</span>
                      <span className="admin-table__meta">
                        {localized(locale, { en: "Most recent change", es: "Último cambio" })}
                      </span>
                    </div>
                    <div className="admin-table__cell admin-table__cell--actions">
                      <Link
                        href={buildPath(`/backoffice/evidence/${item.id}`, locale)}
                        className="button button--solid"
                      >
                        {localized(locale, { en: "Edit", es: "Editar" })}
                      </Link>
                    </div>
                  </article>
                ))}
                </div>
              </div>
            ) : (
              <div className="empty-panel">
                <span className="eyebrow">
                  {localized(locale, { en: "No results", es: "Sin resultados" })}
                </span>
                <h2 className="section-title">
                  {localized(locale, {
                    en: "No evidence matches these filters",
                    es: "No hay evidencias que coincidan con esos filtros",
                  })}
                </h2>
                <p className="section-copy">
                  {localized(locale, {
                    en: "Try clearing the related activity filter or broadening the search terms.",
                    es: "Probá limpiar el filtro por actividad relacionada o ampliar los términos de búsqueda.",
                  })}
                </p>
              </div>
            )}

            <BackofficeCatalogPagination
              locale={locale}
              basePath="/backoffice/evidence"
              page={evidences?.page ?? 1}
              pageSize={evidences?.pageSize ?? 20}
              total={evidences?.total ?? 0}
              query={{
                q,
                status,
                type,
                activityId,
                reliabilityFlag,
              }}
            />
          </section>
        </section>
      </BackofficeShell>
    </SiteShell>
  );
}
