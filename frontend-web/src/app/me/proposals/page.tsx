import Link from "next/link";

import { ProposalsOverview } from "@/components/proposals-overview";
import { SiteShell } from "@/components/site-shell";
import { getProposalInbox, getSessionUser } from "@/lib/api";
import { buildPath, localized, readParam, resolveLocale } from "@/lib/site";

type ProposalsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProposalsPage({
  searchParams,
}: ProposalsPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const [user, inbox] = await Promise.all([getSessionUser(), getProposalInbox(locale)]);

  return (
    <SiteShell locale={locale}>
      {user ? (
        <ProposalsOverview locale={locale} inbox={inbox} />
      ) : (
        <section className="empty-panel page-stack">
          <span className="eyebrow">
            {localized(locale, { en: "Authentication required", es: "Autenticacion requerida" })}
          </span>
          <h1 className="section-title">
            {localized(locale, { en: "Sign in before contributing", es: "Inicia sesion antes de contribuir" })}
          </h1>
          <p className="section-copy">
            {localized(locale, {
              en: "This area will hold your activity and evidence proposals once you are authenticated.",
              es: "Esta area alojara tus propuestas de actividades y evidencias una vez que estes autenticado.",
            })}
          </p>
          <div className="profile-actions" style={{ justifyContent: "center" }}>
            <Link href={buildPath("/auth/login", locale, { returnTo: "/me/proposals" })} className="button button--solid">
              {localized(locale, { en: "Log in", es: "Ingresar" })}
            </Link>
            <Link href={buildPath("/auth/register", locale, { returnTo: "/me/proposals" })} className="button button--ghost">
              {localized(locale, { en: "Create account", es: "Crear cuenta" })}
            </Link>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
