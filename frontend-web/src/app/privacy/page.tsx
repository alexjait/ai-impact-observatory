import { SiteShell } from "@/components/site-shell";
import { localized, readParam, resolveLocale } from "@/lib/site";

type PrivacyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PrivacyPage({ searchParams }: PrivacyPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));

  const sections = [
    {
      title: localized(locale, {
        en: "1. Scope of this policy",
        es: "1. Alcance de esta pol\u00edtica",
      }),
      body: [
        localized(locale, {
          en: "This policy explains, in a practical and accessible way, what information the portal stores, why it stores it, and how that information is used in the normal operation of the project.",
          es: "Esta pol\u00edtica explica, de manera pr\u00e1ctica y accesible, qu\u00e9 informaci\u00f3n guarda el portal, para qu\u00e9 la guarda y c\u00f3mo se usa dentro de la operaci\u00f3n normal del proyecto.",
        }),
        localized(locale, {
          en: "Because the portal is an independent and evolving initiative, privacy practices may be adjusted over time as the project grows, while trying to keep the handling of personal data proportionate and understandable.",
          es: "Como el portal es una iniciativa independiente y en evoluci\u00f3n, las pr\u00e1cticas de privacidad pueden ajustarse con el tiempo a medida que el proyecto crezca, procurando mantener un tratamiento proporcionado y entendible de los datos personales.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "2. Information we may store",
        es: "2. Informaci\u00f3n que podemos guardar",
      }),
      body: [
        localized(locale, {
          en: "Depending on how you use the portal, we may store account data, participation data, operational metadata, and contact messages.",
          es: "Seg\u00fan c\u00f3mo uses el portal, podemos guardar datos de cuenta, datos de participaci\u00f3n, metadatos operativos y mensajes de contacto.",
        }),
      ],
      bullets: [
        localized(locale, {
          en: "Account data: email, display name, session information, authentication method, and locale preference.",
          es: "Datos de cuenta: email, nombre visible, informaci\u00f3n de sesi\u00f3n, m\u00e9todo de autenticaci\u00f3n y preferencia de idioma.",
        }),
        localized(locale, {
          en: "Participation data: comments, reports, activity proposals, evidence proposals, followed activities, and related moderation or editorial history.",
          es: "Datos de participaci\u00f3n: comentarios, denuncias, propuestas de actividad, propuestas de evidencia, actividades seguidas y su historial editorial o de moderaci\u00f3n asociado.",
        }),
        localized(locale, {
          en: "Contact data: name, email, optional subject, and message body sent through the contact form.",
          es: "Datos de contacto: nombre, email, asunto opcional y cuerpo del mensaje enviado por el formulario de contacto.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "3. Why we use this information",
        es: "3. Para qu\u00e9 usamos esta informaci\u00f3n",
      }),
      body: [
        localized(locale, {
          en: "The portal uses this information only for operational, editorial, moderation, security, and communication purposes directly related to the project.",
          es: "El portal usa esta informaci\u00f3n solo con fines operativos, editoriales, de moderaci\u00f3n, seguridad y comunicaci\u00f3n directamente vinculados con el proyecto.",
        }),
      ],
      bullets: [
        localized(locale, {
          en: "Allow sign in and keep a session active.",
          es: "Permitir el inicio de sesi\u00f3n y mantener una sesi\u00f3n activa.",
        }),
        localized(locale, {
          en: "Receive, review, and moderate public contributions.",
          es: "Recibir, revisar y moderar aportes p\u00fablicos.",
        }),
        localized(locale, {
          en: "Support editorial curation and internal backoffice workflows.",
          es: "Sostener la curaci\u00f3n editorial y los flujos internos de backoffice.",
        }),
        localized(locale, {
          en: "Handle messages sent through the contact form.",
          es: "Gestionar mensajes enviados desde el formulario de contacto.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "4. Public and private information",
        es: "4. Informaci\u00f3n p\u00fablica y privada",
      }),
      body: [
        localized(locale, {
          en: "Not everything you submit is public by default. Some data is used only inside moderation, editorial, or administrative workflows.",
          es: "No todo lo que envi\u00e1s es p\u00fablico por defecto. Algunos datos se usan solo dentro de flujos de moderaci\u00f3n, editorial o administraci\u00f3n.",
        }),
        localized(locale, {
          en: "Your followed activities, internal moderation notes, and contact messages are not published as part of the public catalog.",
          es: "Tus actividades seguidas, las notas internas de moderaci\u00f3n y los mensajes de contacto no se publican como parte del cat\u00e1logo p\u00fablico.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "5. Cookies and sessions",
        es: "5. Cookies y sesiones",
      }),
      body: [
        localized(locale, {
          en: "The portal uses session cookies and related technical data to keep authenticated users logged in and to protect access to private areas such as profile, proposals, and backoffice.",
          es: "El portal usa cookies de sesi\u00f3n y datos t\u00e9cnicos relacionados para mantener autenticados a los usuarios y proteger el acceso a \u00e1reas privadas como perfil, propuestas y backoffice.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "6. Contact messages",
        es: "6. Mensajes de contacto",
      }),
      body: [
        localized(locale, {
          en: "If you use the contact form, the portal stores the message and the information you provide so the project can review it internally. If you were logged in at the time of sending it, the message may also be linked to your account.",
          es: "Si us\u00e1s el formulario de contacto, el portal guarda el mensaje y la informaci\u00f3n que brindes para que el proyecto pueda revisarlo internamente. Si estabas logueado al momento del env\u00edo, el mensaje tambi\u00e9n puede quedar asociado a tu cuenta.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "7. Data retention and changes",
        es: "7. Conservaci\u00f3n de datos y cambios",
      }),
      body: [
        localized(locale, {
          en: "The project may retain operational records, contributions, moderation history, and contact messages for as long as they remain useful for the normal functioning, safety, and editorial traceability of the portal.",
          es: "El proyecto puede conservar registros operativos, aportes, historial de moderaci\u00f3n y mensajes de contacto mientras sigan siendo \u00fatiles para el funcionamiento normal, la seguridad y la trazabilidad editorial del portal.",
        }),
        localized(locale, {
          en: "As the project evolves, some privacy practices may change. When that happens, this page can be updated to reflect the new operating criteria.",
          es: "A medida que el proyecto evolucione, algunas pr\u00e1cticas de privacidad pueden cambiar. Cuando eso ocurra, esta p\u00e1gina puede actualizarse para reflejar el nuevo criterio operativo.",
        }),
      ],
    },
    {
      title: localized(locale, {
        en: "8. Important practical note",
        es: "8. Nota pr\u00e1ctica importante",
      }),
      body: [
        localized(locale, {
          en: "This portal is not an official institution and is not intended to function as an authoritative registry of current reality. It is an evolving project that may contain interpretations, editorial summaries, and signals under revision. That also means personal data is handled in the context of a living product that can continue improving its processes over time.",
          es: "Este portal no es una instituci\u00f3n oficial ni est\u00e1 pensado como un registro autoritativo de la realidad actual. Es un proyecto en evoluci\u00f3n que puede contener interpretaciones, res\u00famenes editoriales y se\u00f1ales en revisi\u00f3n. Eso tambi\u00e9n implica que los datos personales se tratan en el contexto de un producto vivo, cuyos procesos pueden seguir mejorando con el tiempo.",
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
            en: "Privacy Policy",
            es: "Pol\u00edtica de Privacidad",
          })}
        </h1>
        <p className="section-copy legal-note">
          {localized(locale, {
            en: "This portal is an independent and evolving editorial project. It is not an official source, and its operation may change as the project matures.",
            es: "Este portal es un proyecto editorial independiente y en evoluci\u00f3n. No es una fuente oficial, y su funcionamiento puede cambiar a medida que el proyecto madure.",
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
