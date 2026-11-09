import Link from "next/link";

import { ActivityCard } from "@/components/activity-card";
import { SiteShell } from "@/components/site-shell";
import { getActivities, getSessionUser, getTaxonomies } from "@/lib/api";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type ActivitiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type CatalogPreset = "high-disruption" | "productivity" | null;

function resolvePreset(value?: string): CatalogPreset {
  if (value === "high-disruption" || value === "productivity") {
    return value;
  }

  return null;
}

function inferPreset(
  preset: CatalogPreset,
  aiStatus: string | undefined,
  hasScopedFilters: boolean,
): CatalogPreset {
  if (preset) {
    return preset;
  }

  if (hasScopedFilters) {
    return null;
  }

  if (aiStatus === "4") {
    return "high-disruption";
  }

  if (aiStatus === "2") {
    return "productivity";
  }

  return null;
}

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const preset = resolvePreset(readParam(params, "preset"));
  const q = readParam(params, "q");
  const industry = readParam(params, "industry");
  const category = readParam(params, "category");
  const rawAiStatus = readParam(params, "aiStatus");
  const followed = readParam(params, "followed");
  const hasScopedFilters = Boolean(q || industry || category);
  const aiStatus =
    rawAiStatus ??
    (preset === "high-disruption"
      ? "4"
      : preset === "productivity"
        ? "2"
        : undefined);
  const activePreset = inferPreset(preset, aiStatus, hasScopedFilters);
  const pageParam = readParam(params, "page");
  const currentPage =
    pageParam && Number.isFinite(Number(pageParam)) && Number(pageParam) > 0
      ? Number(pageParam)
      : 1;

  const [activities, taxonomies, user] = await Promise.all([
    getActivities({
      locale,
      q,
      industry,
      category,
      aiStatus,
      followed,
      page: currentPage,
      pageSize: 12,
    }),
    getTaxonomies(locale),
    getSessionUser(),
  ]);

  const isHighDisruptionView = activePreset === "high-disruption";
  const isProductivityView = activePreset === "productivity";
  const hasActiveFilters = Boolean(q || industry || category || aiStatus || followed === "true");
  const totalPages =
    activities.total > 0 ? Math.ceil(activities.total / activities.pageSize) : 1;

  const activeFilters = [
    q
      ? localized(locale, {
          en: `Search: ${q}`,
          es: `Búsqueda: ${q}`,
        })
      : null,
    industry
      ? localized(locale, {
          en: `Industry: ${taxonomies.industries.find((item) => item.key === industry)?.name ?? industry}`,
          es: `Rubro: ${taxonomies.industries.find((item) => item.key === industry)?.name ?? industry}`,
        })
      : null,
    category
      ? localized(locale, {
          en: `Category: ${taxonomies.categories.find((item) => item.key === category)?.name ?? category}`,
          es: `Categoría: ${taxonomies.categories.find((item) => item.key === category)?.name ?? category}`,
        })
      : null,
    aiStatus
      ? localized(locale, {
          en: `AI status: ${aiStatus}`,
          es: `Estado IA: ${aiStatus}`,
        })
      : null,
    followed === "true"
      ? localized(locale, {
          en: "Only followed",
          es: "Solo seguidas",
        })
      : null,
  ].filter(Boolean) as string[];

  const buildCatalogHref = (overrides?: {
    q?: string;
    industry?: string;
    category?: string;
    aiStatus?: string;
    followed?: string;
    preset?: string;
    page?: number;
  }) =>
    buildPath("/activities", locale, {
      q: overrides?.q ?? q,
      industry: overrides?.industry ?? industry,
      category: overrides?.category ?? category,
      aiStatus: overrides?.aiStatus ?? aiStatus,
      followed: overrides?.followed ?? followed,
      preset: overrides?.preset ?? (preset ?? undefined),
      page:
        (overrides?.page ?? currentPage) > 1
          ? String(overrides?.page ?? currentPage)
          : undefined,
    });

  return (
    <SiteShell locale={locale}>
      <div className="catalog-layout">
        <aside className="filters-panel">
          <form method="GET">
            <input type="hidden" name="locale" value={locale} />
            <label>
              <span>{localized(locale, { en: "Search", es: "Buscar" })}</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder={localized(locale, {
                  en: "Activities, sectors, evidence...",
                  es: "Actividades, sectores, evidencia...",
                })}
              />
            </label>

            <label>
              <span>{localized(locale, { en: "Industry", es: "Rubro" })}</span>
              <select name="industry" defaultValue={industry ?? ""}>
                <option value="">
                  {localized(locale, { en: "All industries", es: "Todos los rubros" })}
                </option>
                {taxonomies.industries.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{localized(locale, { en: "Category", es: "Categoría" })}</span>
              <select name="category" defaultValue={category ?? ""}>
                <option value="">
                  {localized(locale, { en: "All categories", es: "Todas las categorías" })}
                </option>
                {taxonomies.categories.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{localized(locale, { en: "AI status", es: "Estado IA" })}</span>
              <select name="aiStatus" defaultValue={aiStatus ?? ""}>
                <option value="">
                  {localized(locale, { en: "Any level", es: "Cualquier nivel" })}
                </option>
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            {user ? (
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="followed"
                  value="true"
                  defaultChecked={followed === "true"}
                />
                <span>
                  {localized(locale, {
                    en: "Only followed activities",
                    es: "Solo actividades seguidas",
                  })}
                </span>
              </label>
            ) : null}

            <button type="submit" className="button button--solid button--block">
              {localized(locale, { en: "Apply filters", es: "Aplicar filtros" })}
            </button>
          </form>
        </aside>

        <section className="catalog-results page-stack">
          <div className="catalog-header">
            <div>
              <span className="eyebrow">
                {localized(locale, {
                  en: isHighDisruptionView ? "High-impact lane" : "Public catalog",
                  es: isHighDisruptionView ? "Cambios más fuertes" : "Catálogo público",
                })}
              </span>
              <h1 className="section-title">
                {localized(locale, {
                  en: isHighDisruptionView
                    ? "Activities with stronger shifts"
                    : "Explore activities",
                  es: isHighDisruptionView
                    ? "Actividades con cambios más fuertes"
                    : "Explorar actividades",
                })}
              </h1>
              <p className="section-copy">
                {localized(locale, {
                  en: isHighDisruptionView
                    ? "A faster way to inspect activities where AI is already pushing major changes."
                    : isProductivityView
                      ? "A shortcut to activities where AI is mostly showing up as speed, support, or throughput gains."
                      : "Use the catalog to move between sectors, evidence, and concrete work activities.",
                  es: isHighDisruptionView
                    ? "Una vista rápida para recorrer actividades donde la IA ya está empujando cambios grandes."
                    : isProductivityView
                      ? "Un atajo para recorrer actividades donde la IA aparece sobre todo como apoyo, velocidad o mejoras de productividad."
                      : "Usa el catálogo para moverte entre sectores, evidencia y actividades concretas de trabajo.",
                })}
              </p>
            </div>
            <div className="catalog-header__side">
              <p className="section-copy">
                {activities.total}{" "}
                {localized(locale, {
                  en: "results available under current filters",
                  es: "resultados disponibles con los filtros actuales",
                })}
              </p>
              <div className="catalog-actions">
                <Link
                  href={buildPath("/activities", locale)}
                  className={`filter-chip${!activePreset && !q && !industry && !category && !aiStatus && followed !== "true" ? " filter-chip--active" : ""}`}
                >
                  {localized(locale, {
                    en: "All catalog",
                    es: "Todo el catálogo",
                  })}
                </Link>
                <Link
                  href={buildPath("/activities", locale, {
                    preset: "high-disruption",
                    aiStatus: "4",
                    followed: followed === "true" ? "true" : undefined,
                  })}
                  className={`filter-chip${activePreset === "high-disruption" ? " filter-chip--active" : ""}`}
                >
                  {localized(locale, {
                    en: "Stronger shifts",
                    es: "Cambios fuertes",
                  })}
                </Link>
                <Link
                  href={buildPath("/activities", locale, {
                    preset: "productivity",
                    aiStatus: "2",
                    followed: followed === "true" ? "true" : undefined,
                  })}
                  className={`filter-chip${activePreset === "productivity" ? " filter-chip--active" : ""}`}
                >
                  {localized(locale, {
                    en: "Productivity gains",
                    es: "Más productividad",
                  })}
                </Link>
              </div>
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="catalog-summary">
              <div className="catalog-summary__chips">
                {activeFilters.map((item) => (
                  <span key={item} className="tag-chip tag-chip--muted">
                    {item}
                  </span>
                ))}
              </div>
              <Link href={buildPath("/activities", locale)} className="button button--ghost">
                {localized(locale, {
                  en: "Clear filters",
                  es: "Limpiar filtros",
                })}
              </Link>
            </div>
          ) : null}

          {activities.items.length > 0 ? (
            <>
              <div className="activity-grid">
                {activities.items.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    locale={locale}
                    isAuthenticated={Boolean(user)}
                  />
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="pagination-row">
                  <span className="pagination-copy">
                    {localized(locale, {
                      en: `Page ${activities.page} of ${totalPages}`,
                      es: `Página ${activities.page} de ${totalPages}`,
                    })}
                  </span>
                  <div className="action-row">
                    <Link
                      href={buildCatalogHref({ page: Math.max(1, currentPage - 1) })}
                      className={`button button--ghost${currentPage <= 1 ? " is-disabled" : ""}`}
                      aria-disabled={currentPage <= 1}
                    >
                      {localized(locale, { en: "Previous", es: "Anterior" })}
                    </Link>
                    <Link
                      href={buildCatalogHref({ page: Math.min(totalPages, currentPage + 1) })}
                      className={`button button--ghost${currentPage >= totalPages ? " is-disabled" : ""}`}
                      aria-disabled={currentPage >= totalPages}
                    >
                      {localized(locale, { en: "Next", es: "Siguiente" })}
                    </Link>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="empty-panel">
              <h2 className="section-title">
                {localized(locale, {
                  en: "No activities match this filter set",
                  es: "No hay actividades para esta combinación de filtros",
                })}
              </h2>
              <p className="section-copy">
                {localized(locale, {
                  en: "Try removing one taxonomy or search term. This view can also look sparse while we keep publishing the initial seed.",
                  es: "Probá quitando alguna taxonomía o término. Esta vista también puede verse más vacía mientras seguimos publicando el seed inicial.",
                })}
              </p>
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
