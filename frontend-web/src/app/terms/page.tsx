import { SiteShell } from "@/components/site-shell";
import { localized, readParam, resolveLocale } from "@/lib/site";

type TermsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TermsPage({ searchParams }: TermsPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));

  const sections = [
    {
      title: localized(locale, {
        en: "1. Nature of the portal",
        es: "1. Naturaleza del portal",
      }),
      body: [
        localized(locale, {
          en: "AI Impact Observatory is an independent editorial project. It is not an official registry, not a government source, not a regulator, and not a definitive representation of the current state of work, technology, or labor markets.",
          es: "Observatorio de Impacto IA es un proyecto editorial independiente. No es un registro oficial, ni una fuente gubernamental, ni un regulador, ni una representaci\u00f3n definitiva del estado actual del trabajo, la tecnolog\u00eda o los mercados laborales.",
        }),
        localized(locale, {
          en: "The portal is designed as a living map of signals, activities, evidence, and interpretations that can evolve over time. Because of that, some entries may become outdated, incomplete, disputed, or later adjusted.",
          es: "El portal est\u00e1 pensado como un mapa vivo de se\u00f1ales, actividades, evidencias e interpretaciones que pueden evolucionar con el tiempo. Por eso, algunas entradas pueden quedar desactualizadas, incompletas, discutidas o luego ser ajustadas.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "2. Informational and editorial character",
        es: "2. Car\u00e1cter informativo y editorial",
      }),
      body: [
        localized(locale, {
          en: "Content published in the portal has an informational and editorial purpose. It should not be interpreted as legal advice, labor advice, investment advice, regulatory guidance, or a guarantee about the present or future impact of AI on a specific activity.",
          es: "El contenido publicado en el portal tiene una finalidad informativa y editorial. No debe interpretarse como asesoramiento legal, laboral, financiero, regulatorio ni como una garant\u00eda sobre el impacto presente o futuro de la IA en una actividad determinada.",
        }),
        localized(locale, {
          en: "The portal may include judgments, summaries, categorizations, and evidence selected under editorial criteria. Those decisions can change as new information appears.",
          es: "El portal puede incluir juicios, res\u00famenes, categorizaciones y evidencias seleccionadas bajo criterios editoriales. Esas decisiones pueden cambiar a medida que aparezca nueva informaci\u00f3n.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "3. Use of the site",
        es: "3. Uso del sitio",
      }),
      body: [
        localized(locale, {
          en: "By using the portal, you agree to interact in good faith, avoid abusive conduct, avoid submitting unlawful, defamatory, or misleading content, and respect moderation and editorial decisions.",
          es: "Al usar el portal, acept\u00e1s interactuar de buena fe, evitar conductas abusivas, evitar el env\u00edo de contenido ilegal, difamatorio o enga\u00f1oso, y respetar las decisiones de moderaci\u00f3n y editoriales.",
        }),
      ],
      bullets: [
        localized(locale, {
          en: "Do not impersonate other people or organizations.",
          es: "No suplantes a otras personas u organizaciones.",
        }),
        localized(locale, {
          en: "Do not use the portal to harass, spam, or manipulate discussions.",
          es: "No uses el portal para acosar, hacer spam o manipular discusiones.",
        }),
        localized(locale, {
          en: "Do not submit content that clearly lacks a reasonable basis or is intentionally misleading.",
          es: "No env\u00edes contenido que claramente carezca de una base razonable o sea intencionalmente enga\u00f1oso.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "4. Accounts, contributions, and moderation",
        es: "4. Cuentas, aportes y moderaci\u00f3n",
      }),
      body: [
        localized(locale, {
          en: "Some features require an account. If you create one, you are responsible for the information you submit through comments, activity proposals, evidence proposals, and contact forms.",
          es: "Algunas funciones requieren una cuenta. Si la cre\u00e1s, sos responsable de la informaci\u00f3n que env\u00edes mediante comentarios, propuestas de actividad, propuestas de evidencia y formularios de contacto.",
        }),
        localized(locale, {
          en: "The project may moderate, edit, reject, archive, hide, or publish content using editorial and operational criteria. Approval of a contribution does not convert the portal into an official source, nor does it guarantee that the information will remain unchanged over time.",
          es: "El proyecto puede moderar, editar, rechazar, archivar, ocultar o publicar contenido usando criterios editoriales y operativos. La aprobaci\u00f3n de un aporte no convierte al portal en una fuente oficial ni garantiza que la informaci\u00f3n permanezca igual en el tiempo.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "5. Accuracy, availability, and limits",
        es: "5. Precisi\u00f3n, disponibilidad y l\u00edmites",
      }),
      body: [
        localized(locale, {
          en: "We make a reasonable effort to keep the portal useful, but we do not guarantee completeness, permanent availability, or up-to-date accuracy. The information may lag behind current events or later require revision.",
          es: "Se hace un esfuerzo razonable para mantener el portal \u00fatil, pero no se garantiza exhaustividad, disponibilidad permanente ni exactitud totalmente actualizada. La informaci\u00f3n puede ir por detr\u00e1s de los hechos o requerir revisi\u00f3n posterior.",
        }),
        localized(locale, {
          en: "Use the portal as a starting point for exploration and interpretation, not as the sole basis for high-stakes decisions.",
          es: "Us\u00e1 el portal como punto de partida para explorar e interpretar, no como \u00fanica base para decisiones de alto impacto.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "6. External sources and links",
        es: "6. Fuentes externas y enlaces",
      }),
      body: [
        localized(locale, {
          en: "The portal may link to external sources, reports, articles, datasets, and third-party sites. Those sources belong to their respective owners and may change, disappear, or be updated without notice.",
          es: "El portal puede enlazar a fuentes externas, reportes, art\u00edculos, datasets y sitios de terceros. Esas fuentes pertenecen a sus respectivos titulares y pueden cambiar, desaparecer o actualizarse sin aviso.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "7. Changes to the portal and these terms",
        es: "7. Cambios en el portal y en estos t\u00e9rminos",
      }),
      body: [
        localized(locale, {
          en: "The project may update the portal, its scope, publication rules, contribution flows, and these terms as the initiative evolves.",
          es: "El proyecto puede actualizar el portal, su alcance, las reglas de publicaci\u00f3n, los flujos de aporte y estos t\u00e9rminos a medida que la iniciativa evolucione.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "8. Contact",
        es: "8. Contacto",
      }),
      body: [
        localized(locale, {
          en: "If you need to report a problem, request a clarification, or share feedback about the portal, use the contact form available on the site.",
          es: "Si necesit\u00e1s reportar un problema, pedir una aclaraci\u00f3n o compartir feedback sobre el portal, us\u00e1 el formulario de contacto disponible en el sitio.",
        }),
      ],
    },
  ];

  return (
    <SiteShell locale={locale}>
      <section className="glass-panel page-stack legal-page">
        <span className="eyebrow">
          {localized(locale, { en: "Legal", es: "Legal" })}
        </span>
        <h1 className="section-title">
          {localized(locale, {
            en: "Terms and Conditions",
            es: "T\u00e9rminos y Condiciones",
          })}
        </h1>
        <p className="section-copy legal-note">
          {localized(locale, {
            en: "This portal is an independent and evolving editorial initiative. It is not an official source and may not reflect current reality in a complete or final way.",
            es: "Este portal es una iniciativa editorial independiente y en evoluci\u00f3n. No es una fuente oficial y puede no reflejar la realidad actual de manera completa o definitiva.",
          })}
        </p>

        {sections.map((section) => (
          <section key={section.title} className="legal-section">
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets ? (
              <ul className="legal-list">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </section>
    </SiteShell>
  );
}
