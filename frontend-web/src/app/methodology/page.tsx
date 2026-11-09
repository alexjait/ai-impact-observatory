import { SiteShell } from "@/components/site-shell";
import { getMethodology } from "@/lib/api";
import { localized, readParam, resolveLocale } from "@/lib/site";

type MethodologyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MethodologyPage({ searchParams }: MethodologyPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const methodology = await getMethodology(locale);

  return (
    <SiteShell locale={locale}>
      <section className="detail-panel page-stack">
        <div className="detail-copy">
          <span className="eyebrow">
            {localized(locale, { en: "Reading guide", es: "Guia de lectura" })}
          </span>
          <h1>{methodology.title}</h1>
          <p>{methodology.summary}</p>
        </div>

        <div className="grid-three">
          {methodology.levels.map((item) => (
            <div key={item.value} className="metric-card">
              <strong>{item.label}</strong>
              <p>{item.description}</p>
              <span>{item.example}</span>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
