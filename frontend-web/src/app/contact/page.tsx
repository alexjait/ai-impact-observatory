import { ContactForm } from "@/components/contact-form";
import { SiteShell } from "@/components/site-shell";
import { getSessionUser } from "@/lib/api";
import { localized, readParam, resolveLocale } from "@/lib/site";

type ContactPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const user = await getSessionUser();

  return (
    <SiteShell locale={locale}>
      <section className="glass-panel page-stack">
        <span className="eyebrow">
          {localized(locale, { en: "Contact", es: "Contacto" })}
        </span>
        <h1 className="section-title">
          {localized(locale, {
            en: "Write to the project",
            es: "Escribile al proyecto",
          })}
        </h1>
        <p className="section-copy">
          {localized(locale, {
            en: "Use this form for feedback, questions, collaboration ideas, or issues you found while exploring the portal.",
            es: "Usá este formulario para comentarios, preguntas, ideas de colaboración o problemas que encontraste al recorrer el portal.",
          })}
        </p>
        <ContactForm
          locale={locale}
          initialName={user?.displayName}
          initialEmail={user?.email}
        />
      </section>
    </SiteShell>
  );
}
