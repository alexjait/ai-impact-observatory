import Link from "next/link";

import { buildPath, localized, type Locale } from "@/lib/site";

type BackofficeCatalogPaginationProps = {
  locale: Locale;
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  query?: Record<string, string | undefined>;
};

function buildPageList(currentPage: number, pageCount: number) {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(pageCount);

  for (
    let value = Math.max(1, currentPage - 2);
    value <= Math.min(pageCount, currentPage + 2);
    value += 1
  ) {
    pages.add(value);
  }

  return [...pages].sort((left, right) => left - right);
}

export function BackofficeCatalogPagination({
  locale,
  basePath,
  page,
  pageSize,
  total,
  query,
}: BackofficeCatalogPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(total, currentPage * pageSize);
  const pages = buildPageList(currentPage, pageCount);

  return (
    <div className="admin-pagination">
      <p className="admin-pagination__summary">
        {localized(locale, {
          en: `Showing ${start}-${end} of ${total} records`,
          es: `Mostrando ${start}-${end} de ${total} registros`,
        })}
      </p>
      <div className="admin-pagination__controls">
        <Link
          href={buildPath(basePath, locale, {
            ...(query ?? {}),
            page: currentPage > 1 ? String(currentPage - 1) : undefined,
          })}
          className={`button button--ghost ${currentPage <= 1 ? "is-disabled" : ""}`}
          aria-disabled={currentPage <= 1}
          tabIndex={currentPage <= 1 ? -1 : undefined}
        >
          {localized(locale, { en: "Previous", es: "Anterior" })}
        </Link>
        <div className="admin-pagination__pages">
          {pages.map((value, index) => {
            const previous = pages[index - 1];
            const needsGap = previous && value - previous > 1;

            return (
              <span key={value} className="admin-pagination__page-group">
                {needsGap ? <span className="admin-pagination__ellipsis">…</span> : null}
                <Link
                  href={buildPath(basePath, locale, {
                    ...(query ?? {}),
                    page: value > 1 ? String(value) : undefined,
                  })}
                  className={`admin-pagination__page ${
                    value === currentPage ? "admin-pagination__page--active" : ""
                  }`}
                >
                  {value}
                </Link>
              </span>
            );
          })}
        </div>
        <Link
          href={buildPath(basePath, locale, {
            ...(query ?? {}),
            page: currentPage < pageCount ? String(currentPage + 1) : String(pageCount),
          })}
          className={`button button--ghost ${currentPage >= pageCount ? "is-disabled" : ""}`}
          aria-disabled={currentPage >= pageCount}
          tabIndex={currentPage >= pageCount ? -1 : undefined}
        >
          {localized(locale, { en: "Next", es: "Siguiente" })}
        </Link>
      </div>
    </div>
  );
}
