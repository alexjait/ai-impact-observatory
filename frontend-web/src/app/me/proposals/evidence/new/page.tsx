import Link from "next/link";

import { EvidenceProposalForm } from "@/components/evidence-proposal-form";
import { SiteShell } from "@/components/site-shell";
import { getActivities, getAllActivities, getSessionUser } from "@/lib/api";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type NewEvidenceProposalPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewEvidenceProposalPage({
  searchParams,
}: NewEvidenceProposalPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const preselectedActivityKey = readParam(params, "activityKey");
  const preselectedActivityTitle = readParam(params, "activityTitle");
  const [user, activities, preselectedActivityLookup] = await Promise.all([
    getSessionUser(),
    getAllActivities({ locale, sort: "title" }),
    preselectedActivityKey || preselectedActivityTitle
      ? getActivities({
          locale,
          q: preselectedActivityTitle ?? preselectedActivityKey ?? undefined,
          pageSize: 20,
          sort: "title",
        })
      : null,
  ]);
  const mergedActivities = [...activities];

  for (const activity of preselectedActivityLookup?.items ?? []) {
    if (!mergedActivities.some((candidate) => candidate.key === activity.key)) {
      mergedActivities.unshift(activity);
    }
  }

  mergedActivities.sort((left, right) =>
    left.title.localeCompare(right.title, locale, {
      sensitivity: "base",
      ignorePunctuation: true,
    }),
  );

  return (
    <SiteShell locale={locale}>
      {user ? (
        <div className="page-stack">
          <section className="profile-panel">
            <span className="eyebrow">
              {localized(locale, { en: "Contribution flow", es: "Flujo de contribucion" })}
            </span>
            <h1>
              {localized(locale, { en: "Propose new evidence", es: "Proponer nueva evidencia" })}
            </h1>
            <p>
              {localized(locale, {
                en: "This form links evidence to public activities. You write in your own language and the second language is generated automatically for review.",
                es: "Este formulario vincula evidencia a actividades públicas. Tú escribes en tu idioma y el segundo idioma se genera automáticamente para revisión.",
              })}
            </p>
          </section>

          <EvidenceProposalForm
            locale={locale}
            activities={mergedActivities}
            preselectedActivityKey={preselectedActivityKey}
            preselectedActivityTitle={preselectedActivityTitle}
          />
        </div>
      ) : (
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "Authentication required", es: "Autenticacion requerida" })}
          </span>
          <h1 className="section-title">
            {localized(locale, { en: "Log in to submit evidence", es: "Ingresa para enviar evidencia" })}
          </h1>
          <div className="profile-actions" style={{ justifyContent: "center" }}>
            <Link
              href={buildPath("/auth/login", locale, {
                returnTo: buildPath("/me/proposals/evidence/new", locale, {
                  activityKey: preselectedActivityKey,
                  activityTitle: preselectedActivityTitle,
                }),
              })}
              className="button button--solid"
            >
              {localized(locale, { en: "Log in", es: "Ingresar" })}
            </Link>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
