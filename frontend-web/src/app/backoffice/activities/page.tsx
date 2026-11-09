import Link from "next/link";

import { BackofficeCatalogPagination } from "@/components/backoffice-catalog-pagination";
import { BackofficeShell } from "@/components/backoffice-shell";
import { SiteShell } from "@/components/site-shell";
import {
  getEditorialCatalogActivities,
  getEditorialCatalogReferences,
  getModerationQueue,
  getSessionUser,
} from "@/lib/api";
import { canAccessBackoffice, canEditEditorial } from "@/lib/access";
import {
  buildPath,
  formatAiStatus,
  formatDate,
  formatEditorialStatus,
  formatGranularity,
  localized,
  readParam,
  resolveLocale,
} from "@/lib/site";

type BackofficeActivitiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BackofficeActivitiesPage({
  searchParams,
}: BackofficeActivitiesPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const q = readParam(params, "q") ?? undefined;
  const status = readParam(params, "status") ?? undefined;
  const granularity = readParam(params, "granularity") ?? undefined;
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
            {localized(locale, { en: "Activities", es: "Actividades" })}
          </span>
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

  const [queue, references, activities] = await Promise.all([
    getModerationQueue({ locale, type: "activities" }),
    getEditorialCatalogReferences(locale),
    getEditorialCatalogActivities({
      locale,
      q,
      status,
      granularity,
      officialAiStatus,
      industry,
      category,
      page: Number.isFinite(page) && page > 0 ? page : 1,
    }),
  ]);

  return (
    <SiteShell locale={locale} wide>
      <BackofficeShell locale={locale} user={user} section="activities" summary={queue?.summary}>
        <section className="glass-panel page-stack">
          <div className="section-header">
            <div>
              <span className="eyebrow">
                {localized(locale, { en: "Activities", es: "Actividades" })}
              </span>
              <h1 className="section-title">
                {localized(locale, {
                  en: "Activity catalog management",
                  es: "Gestión del catálogo de actividades",
                })}
              </h1>
              <p className="section-copy">
                {localized(locale, {
                  en: "Browse the live activity catalog, refine the result set and jump into creation or editing without leaving the module.",
                  es: "Recorré el catálogo vivo de actividades, afiná el conjunto de resultados y entrá a crear o editar sin salir del módulo.",
                })}
              </p>
            </div>
            <Link
              href={buildPath("/backoffice/activities/new", locale)}
              className="button button--solid"
            >
              {localized(locale, { en: "New activity", es: "Nueva actividad" })}
            </Link>
          </div>

          <div className="admin-summary">
            <article className="admin-stat">
              <span className="eyebrow">
                {localized(locale, { en: "Results", es: "Resultados" })}
              </span>
              <strong>{activities?.total ?? 0}</strong>
              <p>
                {localized(locale, {
                  en: "Total activities matching the current filters.",
                  es: "Total de actividades que coinciden con los filtros actuales.",
                })}
              </p>
            </article>
            <article className="admin-stat">
              <span className="eyebrow">
                {localized(locale, { en: "Page", es: "Página" })}
              </span>
              <strong>
                {activities?.page ?? 1}
                <span className="admin-stat__muted">
                  {" / "}
                  {Math.max(1, Math.ceil((activities?.total ?? 0) / (activities?.pageSize ?? 20)))}
                </span>
              </strong>
              <p>
                {localized(locale, {
                  en: "Each page shows up to 20 records.",
                  es: "Cada página muestra hasta 20 registros.",
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
                  en: "Records are sorted by last update so the latest editorial work stays visible.",
                  es: "Los registros se ordenan por última actualización para que lo más reciente quede arriba.",
                })}
              </p>
            </article>
          </div>

          <form
            className="glass-panel admin-filter-panel page-stack"
            method="GET"
            action="/backoffice/activities"
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
                  en: "Use search, status and taxonomy filters to narrow the operational list before editing.",
                  es: "Usá búsqueda, estado y taxonomías para acotar el listado operativo antes de editar.",
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
                    en: "Title, slug or keyword",
                    es: "Título, slug o palabra clave",
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
                <span>{localized(locale, { en: "Granularity", es: "Granularidad" })}</span>
                <select name="granularity" defaultValue={granularity ?? ""}>
                  <option value="">{localized(locale, { en: "Any", es: "Cualquiera" })}</option>
                  {["tarea", "funcion", "rol", "profesion"].map((value) => (
                    <option key={value} value={value}>
                      {formatGranularity(value, locale)}
                    </option>
                  ))}
                </select>
              </label>
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
                  name="industry"
                  defaultValue={industry ?? ""}
                  list="backoffice-activity-industries"
                  placeholder={localized(locale, {
                    en: "Type or pick an industry",
                    es: "Escribí o elegí una industria",
                  })}
                />
              </label>
              <label className="comment-form">
                <span>{localized(locale, { en: "Category", es: "Categoría" })}</span>
                <input
                  name="category"
                  defaultValue={category ?? ""}
                  list="backoffice-activity-categories"
                  placeholder={localized(locale, {
                    en: "Type or pick a category",
                    es: "Escribí o elegí una categoría",
                  })}
                />
              </label>
            </div>
            <datalist id="backoffice-activity-industries">
              {references?.industries.map((item) => (
                <option key={item.key} value={item.name} />
              ))}
            </datalist>
            <datalist id="backoffice-activity-categories">
              {references?.categories.map((item) => (
                <option key={item.key} value={item.name} />
              ))}
            </datalist>
            <div className="action-row">
              <button type="submit" className="button button--solid">
                {localized(locale, { en: "Apply filters", es: "Aplicar filtros" })}
              </button>
              <Link href={buildPath("/backoffice/activities", locale)} className="button button--ghost">
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
                <h2>{localized(locale, { en: "Activities", es: "Actividades" })}</h2>
              </div>
              <p className="section-copy">
                {localized(locale, {
                  en: "The list below shows the current page of results, sorted by last update.",
                  es: "La lista de abajo muestra la página actual de resultados, ordenada por última actualización.",
                })}
              </p>
            </div>

            {activities?.items.length ? (
              <div className="admin-table-scroll">
                <div
                  className="admin-table admin-table--activities"
                  role="table"
                  aria-label={localized(locale, {
                    en: "Activities list",
                    es: "Listado de actividades",
                  })}
                >
                <div className="admin-table__head" role="row">
                  <span>{localized(locale, { en: "Activity", es: "Actividad" })}</span>
                  <span>{localized(locale, { en: "Classification", es: "Clasificación" })}</span>
                  <span>{localized(locale, { en: "Editorial state", es: "Estado editorial" })}</span>
                  <span>{localized(locale, { en: "Evidence", es: "Evidencias" })}</span>
                  <span>{localized(locale, { en: "Updated", es: "Actualizado" })}</span>
                  <span>{localized(locale, { en: "Actions", es: "Acciones" })}</span>
                </div>
                {activities.items.map((item) => (
                  <article key={item.id} className="admin-table__row" role="row">
                    <div className="admin-table__cell admin-table__cell--primary">
                      <strong>{item.title}</strong>
                      <span>{item.slug}</span>
                    </div>
                    <div className="admin-table__cell">
                      <div className="detail-tags">
                        <span className="tag-chip">{formatGranularity(item.granularity, locale)}</span>
                      </div>
                      <span className="admin-table__meta">{item.industryNames.join(" · ") || "—"}</span>
                      <span className="admin-table__meta">{item.categoryNames.join(" · ") || "—"}</span>
                    </div>
                    <div className="admin-table__cell">
                      <span className="status-pill">
                        {formatEditorialStatus(item.editorialStatus, locale)}
                      </span>
                      <span className="admin-table__meta">
                        {formatAiStatus(item.officialAiStatus, locale)}
                      </span>
                    </div>
                    <div className="admin-table__cell">
                      <strong>{item.evidenceCount}</strong>
                      <span className="admin-table__meta">
                        {localized(locale, {
                          en: item.evidenceCount === 1 ? "linked evidence" : "linked evidences",
                          es:
                            item.evidenceCount === 1
                              ? "evidencia vinculada"
                              : "evidencias vinculadas",
                        })}
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
                        href={buildPath(`/backoffice/activities/${item.id}`, locale)}
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
                    en: "No activities match these filters",
                    es: "No hay actividades que coincidan con esos filtros",
                  })}
                </h2>
                <p className="section-copy">
                  {localized(locale, {
                    en: "Try widening the search or clear the taxonomy filters.",
                    es: "Probá ampliar la búsqueda o limpiar los filtros de taxonomía.",
                  })}
                </p>
              </div>
            )}

            <BackofficeCatalogPagination
              locale={locale}
              basePath="/backoffice/activities"
              page={activities?.page ?? 1}
              pageSize={activities?.pageSize ?? 20}
              total={activities?.total ?? 0}
              query={{
                q,
                status,
                granularity,
                officialAiStatus,
                industry,
                category,
              }}
            />
          </section>
        </section>
      </BackofficeShell>
    </SiteShell>
  );
}
