import Link from "next/link";
import { notFound } from "next/navigation";

import { ActivityProposalForm } from "@/components/activity-proposal-form";
import { SiteShell } from "@/components/site-shell";
import {
  getActivityProposalDetail,
  getSessionUser,
  getTaxonomies,
} from "@/lib/api";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type EditActivityProposalPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditActivityProposalPage({
  params,
  searchParams,
}: EditActivityProposalPageProps) {
  const routeParams = await params;
  const queryParams = await searchParams;
  const locale = resolveLocale(readParam(queryParams, "locale"));
  const [user, taxonomies, proposal] = await Promise.all([
    getSessionUser(),
    getTaxonomies(locale),
    getActivityProposalDetail(routeParams.id),
  ]);

  if (!proposal) {
    notFound();
  }

  return (
    <SiteShell locale={locale}>
      {user ? (
        <div className="page-stack">
          <section className="profile-panel">
            <span className="eyebrow">
              {localized(locale, { en: "Contribution flow", es: "Flujo de contribucion" })}
            </span>
            <h1>
              {localized(locale, {
                en: "Edit activity proposal",
                es: "Editar propuesta de actividad",
              })}
            </h1>
            <p>
              {proposal.canEdit
                ? localized(locale, {
                    en: "You can update this proposal while it is pending or when moderation requests a correction.",
                    es: "Puedes actualizar esta propuesta mientras siga pendiente o cuando moderación solicite una corrección.",
                  })
                : localized(locale, {
                    en: "This proposal is no longer editable because moderation already reviewed it.",
                    es: "Esta propuesta ya no es editable porque moderación ya la revisó.",
                  })}
            </p>
          </section>

          {proposal.canEdit ? (
            <ActivityProposalForm
              locale={locale}
              taxonomies={taxonomies}
              mode="edit"
              proposalId={proposal.id}
              initialData={proposal}
            />
          ) : (
            <section className="empty-panel page-stack">
              <p className="section-copy">
                {localized(locale, {
                  en: "Return to your inbox to review the latest status.",
                  es: "Vuelve a tu bandeja para revisar el estado más reciente.",
                })}
              </p>
              <div className="profile-actions" style={{ justifyContent: "center" }}>
                <Link href={buildPath("/me/proposals", locale)} className="button button--solid">
                  {localized(locale, { en: "Back to proposals", es: "Volver a propuestas" })}
                </Link>
              </div>
            </section>
          )}
        </div>
      ) : (
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "Authentication required", es: "Autenticacion requerida" })}
          </span>
          <h1 className="section-title">
            {localized(locale, {
              en: "Log in to edit this proposal",
              es: "Ingresa para editar esta propuesta",
            })}
          </h1>
          <div className="profile-actions" style={{ justifyContent: "center" }}>
            <Link
              href={buildPath("/auth/login", locale, { returnTo: `/me/proposals/activity/${routeParams.id}/edit` })}
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
