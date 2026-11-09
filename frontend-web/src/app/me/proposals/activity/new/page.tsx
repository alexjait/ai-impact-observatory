import Link from "next/link";

import { ActivityProposalForm } from "@/components/activity-proposal-form";
import { SiteShell } from "@/components/site-shell";
import { getSessionUser, getTaxonomies } from "@/lib/api";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type NewActivityProposalPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewActivityProposalPage({
  searchParams,
}: NewActivityProposalPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const [user, taxonomies] = await Promise.all([
    getSessionUser(),
    getTaxonomies(locale),
  ]);

  return (
    <SiteShell locale={locale}>
      {user ? (
        <div className="page-stack">
          <section className="profile-panel">
            <span className="eyebrow">
              {localized(locale, { en: "Contribution flow", es: "Flujo de contribución" })}
            </span>
            <h1>
              {localized(locale, { en: "Propose a new activity", es: "Proponer nueva actividad" })}
            </h1>
            <p>
              {localized(locale, {
                en: "Describe the activity once, choose where it belongs, and the second language will be completed automatically.",
                es: "Describe la actividad una sola vez, elegí dónde encaja y el segundo idioma se completa automáticamente.",
              })}
            </p>
          </section>

          <ActivityProposalForm locale={locale} taxonomies={taxonomies} />
        </div>
      ) : (
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "Authentication required", es: "Autenticacion requerida" })}
          </span>
          <h1 className="section-title">
            {localized(locale, { en: "Log in to submit an activity", es: "Ingresa para enviar una actividad" })}
          </h1>
          <div className="profile-actions" style={{ justifyContent: "center" }}>
            <Link href={buildPath("/auth/login", locale, { returnTo: "/me/proposals/activity/new" })} className="button button--solid">
              {localized(locale, { en: "Log in", es: "Ingresar" })}
            </Link>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
