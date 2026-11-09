"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { type ActivityProposalDetail, type TaxonomyCollection } from "@/lib/api";
import { resolveApiErrorMessage } from "@/lib/api-errors";
import { type Locale, buildPath, formatGranularity, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

const GRANULARITIES = ["tarea", "funcion", "rol", "profesion"] as const;

type ActivityProposalFormProps = {
  locale: Locale;
  taxonomies: TaxonomyCollection;
  mode?: "create" | "edit";
  proposalId?: string;
  initialData?: ActivityProposalDetail;
};

export function ActivityProposalForm({
  locale,
  taxonomies,
  mode = "create",
  proposalId,
  initialData,
}: ActivityProposalFormProps) {
  const activeLocale = locale;
  const translatedLocale = locale === "es" ? "en" : "es";
  const activeTranslation =
    initialData?.translations[activeLocale] ??
    initialData?.translations[translatedLocale];
  const sortedIndustries = useMemo(
    () =>
      [...taxonomies.industries].sort((left, right) =>
        left.name.localeCompare(right.name, locale, {
          sensitivity: "base",
          ignorePunctuation: true,
        }),
      ),
    [locale, taxonomies.industries],
  );
  const sortedCategories = useMemo(
    () =>
      [...taxonomies.categories].sort((left, right) =>
        left.name.localeCompare(right.name, locale, {
          sensitivity: "base",
          ignorePunctuation: true,
        }),
      ),
    [locale, taxonomies.categories],
  );
  const [granularity, setGranularity] = useState<(typeof GRANULARITIES)[number]>(
    initialData?.granularity ?? "tarea",
  );
  const [industryKeys, setIndustryKeys] = useState<string[]>(initialData?.industryKeys ?? []);
  const [categoryKeys, setCategoryKeys] = useState<string[]>(initialData?.categoryKeys ?? []);
  const [title, setTitle] = useState(activeTranslation?.title ?? "");
  const [shortDescription, setShortDescription] = useState(
    activeTranslation?.shortDescription ?? "",
  );
  const [fullDescription, setFullDescription] = useState(
    activeTranslation?.fullDescription ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = mode === "edit";

  function toggleValue(
    current: string[],
    value: string,
    setter: (items: string[]) => void,
  ) {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!industryKeys.length || !categoryKeys.length) {
      setError(
        localized(locale, {
          en: "Choose at least one industry and one category before submitting.",
          es: "Elegí al menos un rubro y una categoría antes de enviar.",
        }),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        isEdit && proposalId
          ? `${API_BASE_URL}/me/activity-proposals/${proposalId}`
          : `${API_BASE_URL}/me/activity-proposals`,
        {
          method: isEdit ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            granularity,
            industryKeys,
            categoryKeys,
            inputLocale: activeLocale,
            translationInput: {
              title,
              shortDescription,
              fullDescription,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await resolveApiErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "Could not submit the activity proposal.",
              es: "No se pudo enviar la propuesta de actividad.",
            }),
          ),
        );
      }

      setMessage(
        localized(locale, {
          en: isEdit
            ? "Activity proposal updated successfully."
            : "Activity proposal submitted successfully. You can review it from your private inbox.",
          es: isEdit
            ? "La propuesta de actividad se actualizó con éxito."
            : "La propuesta de actividad se envió con éxito. Ya puedes revisarla desde tu bandeja privada.",
        }),
      );
      if (!isEdit) {
        setGranularity("tarea");
        setIndustryKeys([]);
        setCategoryKeys([]);
        setTitle("");
        setShortDescription("");
        setFullDescription("");
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected proposal error.",
              es: "Error inesperado de propuesta.",
            }),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="proposal-form" onSubmit={handleSubmit}>
      {initialData?.moderationNote ? (
        <section className="glass-panel page-stack moderation-note-panel">
          <div>
            <span className="eyebrow">
              {localized(locale, { en: "Moderation", es: "Moderación" })}
            </span>
            <h2>
              {localized(locale, {
                en:
                  initialData.status === "needs_correction"
                    ? "Changes requested"
                    : "Latest moderator note",
                es:
                  initialData.status === "needs_correction"
                    ? "Corrección solicitada"
                    : "Última nota del moderador",
              })}
            </h2>
          </div>
          <p className="section-copy">
            {localized(locale, {
              en:
                initialData.status === "needs_correction"
                  ? "Use this note as the guide for your next revision before resubmitting."
                  : "This note explains the latest moderation decision on your proposal.",
              es:
                initialData.status === "needs_correction"
                  ? "Usa esta nota como guía para ajustar la propuesta antes de reenviarla."
                  : "Esta nota explica la decisión de moderación más reciente sobre tu propuesta.",
            })}
          </p>
          <p>{initialData.moderationNote}</p>
        </section>
      ) : null}

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Identity", es: "Identidad" })}
          </span>
          <h2>{localized(locale, { en: "Activity scope", es: "Alcance de la actividad" })}</h2>
        </div>

        <label>
          <span>{localized(locale, { en: "Granularity", es: "Granularidad" })}</span>
          <select
            value={granularity}
            onChange={(event) =>
              setGranularity(event.target.value as (typeof GRANULARITIES)[number])
            }
          >
            {GRANULARITIES.map((value) => (
              <option key={value} value={value}>
                {formatGranularity(value, locale)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Taxonomies", es: "Taxonomías" })}
          </span>
          <h2>{localized(locale, { en: "Classification", es: "Clasificación" })}</h2>
          <p className="section-copy">
            {localized(locale, {
              en: "Choose at least one industry and one functional category. Each group is separate, even if you scroll quickly through the page.",
              es: "Elegí al menos un rubro y una categoría funcional. Cada grupo está separado para que se entienda mejor incluso al recorrer la página rápido.",
            })}
          </p>
        </div>

        <div className="taxonomy-section">
          <div className="taxonomy-section__header">
            <span className="eyebrow">
              {localized(locale, { en: "Industries", es: "Rubros" })}
            </span>
            <p className="section-copy">
              {localized(locale, {
                en: "Use industries to show in which part of the economy or sector this activity usually appears.",
                es: "Usa rubros para mostrar en qué sector o área de actividad suele aparecer esta actividad.",
              })}
            </p>
          </div>
          <div className="checkbox-grid">
            {sortedIndustries.map((item) => (
              <label key={item.key} className="checkbox-card">
                <input
                  type="checkbox"
                  checked={industryKeys.includes(item.key)}
                  onChange={() => toggleValue(industryKeys, item.key, setIndustryKeys)}
                />
                <span>{item.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="taxonomy-section">
          <div className="taxonomy-section__header">
            <span className="eyebrow">
              {localized(locale, {
                en: "Functional categories",
                es: "Categorías funcionales",
              })}
            </span>
            <p className="section-copy">
              {localized(locale, {
                en: "Use functional categories to describe the kind of work being done, beyond the sector where it happens.",
                es: "Usa categorías funcionales para describir qué tipo de trabajo se hace, más allá del sector donde ocurre.",
              })}
            </p>
          </div>
          <div className="checkbox-grid">
            {sortedCategories.map((item) => (
              <label key={item.key} className="checkbox-card">
                <input
                  type="checkbox"
                  checked={categoryKeys.includes(item.key)}
                  onChange={() => toggleValue(categoryKeys, item.key, setCategoryKeys)}
                />
                <span>{item.name}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">{activeLocale.toUpperCase()}</span>
          <h2>
            {localized(locale, {
              en:
                activeLocale === "en"
                  ? "Write the activity in English"
                  : "Write the activity in Spanish",
              es:
                activeLocale === "es"
                  ? "Redacta la actividad en español"
                  : "Redacta la actividad en inglés",
            })}
          </h2>
          <p className="section-copy">
            {localized(locale, {
              en: "Write this in the language you feel most comfortable with. The other version is completed automatically so you don't have to repeat the work.",
              es: "Escribe esto en el idioma que te resulte más cómodo. La otra versión se completa automáticamente para que no tengas que repetir el trabajo.",
            })}
          </p>
        </div>
        <label>
          <span>{localized(locale, { en: "Title", es: "Título" })}</span>
          <span className="field-help">
            {localized(locale, {
              en: "Use the clearest public name for the activity, role, function, or task you want to add.",
              es: "Usa el nombre público más claro para la actividad, rol, función o tarea que quieres agregar.",
            })}
          </span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label>
          <span>{localized(locale, { en: "Short description", es: "Descripción corta" })}</span>
          <span className="field-help">
            {localized(locale, {
              en: "Explain briefly what this activity is about so someone can recognize it quickly in the catalog.",
              es: "Explica brevemente de qué trata esta actividad para que alguien pueda reconocerla rápido en el catálogo.",
            })}
          </span>
          <input
            value={shortDescription}
            onChange={(event) => setShortDescription(event.target.value)}
          />
        </label>
        <label>
          <span>{localized(locale, { en: "Full description", es: "Descripción completa" })}</span>
          <span className="field-help">
            {localized(locale, {
              en: "Add more context if the short description is not enough to explain the work clearly.",
              es: "Agrega más contexto si la descripción corta no alcanza para explicar bien el trabajo.",
            })}
          </span>
          <textarea
            value={fullDescription}
            onChange={(event) => setFullDescription(event.target.value)}
            rows={5}
          />
        </label>
      </section>

      {message ? (
        <div className="form-feedback form-feedback--success">
          <p>{message}</p>
          <Link href={buildPath("/me/proposals", locale)} className="button button--ghost">
            {localized(locale, { en: "Go to my proposals", es: "Ir a mis propuestas" })}
          </Link>
        </div>
      ) : null}
      {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

      <button type="submit" className="button button--solid" disabled={isSubmitting}>
        {isSubmitting
          ? localized(locale, { en: "Submitting...", es: "Enviando..." })
          : localized(locale, {
              en: isEdit ? "Save activity proposal" : "Submit activity proposal",
              es: isEdit ? "Guardar propuesta de actividad" : "Enviar propuesta de actividad",
            })}
      </button>
    </form>
  );
}
