"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { type ActivityCard, type EvidenceProposalDetail } from "@/lib/api";
import { resolveApiErrorMessage } from "@/lib/api-errors";
import { type Locale, buildPath, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

type EvidenceProposalFormProps = {
  locale: Locale;
  activities: ActivityCard[];
  mode?: "create" | "edit";
  proposalId?: string;
  initialData?: EvidenceProposalDetail;
  preselectedActivityKey?: string | null;
  preselectedActivityTitle?: string | null;
};

export function EvidenceProposalForm({
  locale,
  activities,
  mode = "create",
  proposalId,
  initialData,
  preselectedActivityKey,
  preselectedActivityTitle,
}: EvidenceProposalFormProps) {
  const sortedActivities = useMemo(
    () =>
      [...activities].sort((left, right) =>
        left.title.localeCompare(right.title, locale, {
          sensitivity: "base",
          ignorePunctuation: true,
        }),
      ),
    [activities, locale],
  );
  const activeLocale = locale;
  const translatedLocale = locale === "es" ? "en" : "es";
  const activeTranslation =
    initialData?.translations[activeLocale] ??
    initialData?.translations[translatedLocale];
  const [type, setType] = useState(initialData?.type ?? "");
  const [sourceText, setSourceText] = useState(initialData?.sourceText ?? "");
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl ?? "");
  const [eventDate, setEventDate] = useState(
    initialData?.eventDate ? initialData.eventDate.slice(0, 10) : "",
  );
  const resolvedPreselectedActivityKey =
    preselectedActivityKey && activities.some((activity) => activity.key === preselectedActivityKey)
      ? preselectedActivityKey
      : null;
  const [activityKeys, setActivityKeys] = useState<string[]>(
    Array.from(new Set([...(initialData?.activityKeys ?? []), ...(resolvedPreselectedActivityKey ? [resolvedPreselectedActivityKey] : [])])),
  );
  const [activitySearch, setActivitySearch] = useState("");
  const [activityOptions, setActivityOptions] = useState<ActivityCard[]>(sortedActivities);
  const [isLoadingActivityOptions, setIsLoadingActivityOptions] = useState(false);
  const [title, setTitle] = useState(activeTranslation?.title ?? "");
  const [summary, setSummary] = useState(activeTranslation?.summary ?? "");
  const [context, setContext] = useState(activeTranslation?.context ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = mode === "edit";

  function toggleActivity(key: string) {
    setActivityKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadActivityOptions() {
      const searchTerm = activitySearch.trim();

      if (searchTerm.length < 2) {
        setActivityOptions(sortedActivities);
        return;
      }

      setIsLoadingActivityOptions(true);

      try {
        const params = new URLSearchParams({
          locale,
          q: searchTerm,
          page: "1",
          pageSize: "20",
        });
        const response = await fetch(`${API_BASE_URL}/public/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error("activity search failed");
        }

        const payload = (await response.json()) as {
          items?: ActivityCard[];
        };

        if (!isCancelled) {
          const merged = [...(payload.items ?? [])];

          for (const activity of sortedActivities) {
            if (activityKeys.includes(activity.key) && !merged.some((item) => item.key === activity.key)) {
              merged.unshift(activity);
            }
          }

          merged.sort((left, right) =>
            left.title.localeCompare(right.title, locale, {
              sensitivity: "base",
              ignorePunctuation: true,
            }),
          );
          setActivityOptions(merged);
        }
      } catch {
        if (!isCancelled) {
          setActivityOptions(sortedActivities);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingActivityOptions(false);
        }
      }
    }

    void loadActivityOptions();

    return () => {
      isCancelled = true;
    };
  }, [activityKeys, activitySearch, locale, sortedActivities]);

  const visibleActivityOptions = useMemo(() => {
    const selected = sortedActivities.filter((activity) => activityKeys.includes(activity.key));
    const merged = [...selected];

    for (const option of activityOptions) {
      if (!merged.some((activity) => activity.key === option.key)) {
        merged.push(option);
      }
    }

    return merged;
  }, [activityKeys, activityOptions, sortedActivities]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!activityKeys.length) {
      setError(
        localized(locale, {
          en: "Link the evidence to at least one activity.",
          es: "Vincula la evidencia a al menos una actividad.",
        }),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        isEdit && proposalId
          ? `${API_BASE_URL}/me/evidence-proposals/${proposalId}`
          : `${API_BASE_URL}/me/evidence-proposals`,
        {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          type,
          sourceText,
          sourceUrl: sourceUrl || undefined,
          eventDate: eventDate || undefined,
          activityKeys,
          inputLocale: activeLocale,
          translationInput: {
            title,
            summary,
            context,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          await resolveApiErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "Could not submit the evidence proposal.",
              es: "No se pudo enviar la propuesta de evidencia.",
            }),
          ),
        );
      }

      setMessage(
        localized(locale, {
          en: isEdit
            ? "Evidence proposal updated successfully."
            : "Evidence proposal submitted successfully. You can review it from your private inbox.",
          es: isEdit
            ? "La propuesta de evidencia se actualizó con éxito."
            : "La propuesta de evidencia se envió con éxito. Ya puedes revisarla desde tu bandeja privada.",
        }),
      );
      if (!isEdit) {
        setType("");
        setSourceText("");
        setSourceUrl("");
        setEventDate("");
        setActivityKeys([]);
        setTitle("");
        setSummary("");
        setContext("");
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected evidence proposal error.",
              es: "Error inesperado de propuesta de evidencia.",
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
                  ? "Use this note as the guide for the next version before resubmitting."
                  : "This note explains the latest moderation decision on your proposal.",
              es:
                initialData.status === "needs_correction"
                  ? "Usa esta nota como guía para preparar la próxima versión antes de reenviarla."
                  : "Esta nota explica la decisión de moderación más reciente sobre tu propuesta.",
            })}
          </p>
          <p>{initialData.moderationNote}</p>
        </section>
      ) : null}

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Source and type", es: "Fuente y tipo" })}
          </span>
          <h2>{localized(locale, { en: "Evidence identity", es: "Identidad de evidencia" })}</h2>
        </div>

        <label>
          <span>{localized(locale, { en: "Evidence type", es: "Tipo de evidencia" })}</span>
          <span className="field-help">
            {localized(locale, {
              en: "Use a short label such as report, dataset, article, benchmark, or product release.",
              es: "Usa una etiqueta corta como informe, dataset, artículo, benchmark o lanzamiento de producto.",
            })}
          </span>
          <input value={type} onChange={(event) => setType(event.target.value)} required />
        </label>

        <label>
          <span>{localized(locale, { en: "Source text", es: "Fuente textual" })}</span>
          <span className="field-help">
            {localized(locale, {
              en: "Paste the source title or the clearest text that helps identify the evidence.",
              es: "Pega el título de la fuente o el texto más claro para identificar la evidencia.",
            })}
          </span>
          <input value={sourceText} onChange={(event) => setSourceText(event.target.value)} required />
        </label>

        <label>
          <span>URL</span>
          <span className="field-help">
            {localized(locale, {
              en: "Optional, but recommended when the source is public and stable.",
              es: "Opcional, pero recomendable cuando la fuente es pública y estable.",
            })}
          </span>
          <input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
        </label>

        <label>
          <span>{localized(locale, { en: "Event date", es: "Fecha del hecho" })}</span>
          <span className="field-help">
            {localized(locale, {
              en: "Use the publication date or the closest known date for the event.",
              es: "Usa la fecha de publicación o la fecha más cercana conocida para el hecho.",
            })}
          </span>
          <input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
        </label>
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Related activities", es: "Actividades relacionadas" })}
          </span>
          <h2>{localized(locale, { en: "Link context", es: "Contexto vinculado" })}</h2>
          <p className="section-copy">
            {localized(locale, {
              en: "Search across approved public activities. Selected activities stay visible while you keep searching.",
              es: "Busca entre las actividades públicas aprobadas. Las actividades ya seleccionadas quedan visibles mientras seguís buscando.",
            })}
          </p>
        </div>

        {resolvedPreselectedActivityKey ? (
          <div className="form-feedback form-feedback--success">
            <p>
              {localized(locale, {
                en: `Starting from activity: ${preselectedActivityTitle ?? resolvedPreselectedActivityKey}`,
                es: `Partiendo desde la actividad: ${preselectedActivityTitle ?? resolvedPreselectedActivityKey}`,
              })}
            </p>
          </div>
        ) : null}

        <label>
          <span>{localized(locale, { en: "Search activities", es: "Buscar actividades" })}</span>
          <input
            type="search"
            value={activitySearch}
            onChange={(event) => setActivitySearch(event.target.value)}
            placeholder={localized(locale, {
              en: "Type at least 2 characters to search the catalog...",
              es: "Escribe al menos 2 caracteres para buscar en el catálogo...",
            })}
          />
        </label>

        <div className="checkbox-grid">
          {visibleActivityOptions.map((activity) => (
            <label key={activity.id} className="checkbox-card">
              <input
                type="checkbox"
                checked={activityKeys.includes(activity.key)}
                onChange={() => toggleActivity(activity.key)}
              />
              <span>{activity.title}</span>
            </label>
          ))}
        </div>
        {isLoadingActivityOptions ? (
          <p className="section-copy">
            {localized(locale, {
              en: "Searching activities...",
              es: "Buscando actividades...",
            })}
          </p>
        ) : null}
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">
            {activeLocale.toUpperCase()}
          </span>
          <h2>
            {localized(locale, {
              en:
                activeLocale === "en"
                  ? "Write the evidence in English"
                  : "Write the evidence in Spanish",
              es:
                activeLocale === "es"
                  ? "Redacta la evidencia en español"
                  : "Redacta la evidencia en inglés",
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
          <span>{localized(locale, { en: "Title", es: "Titulo" })}</span>
          <span className="field-help">
            {localized(locale, {
              en: "Think of a headline someone could quickly understand from the catalog.",
              es: "Piensa en un título que alguien pueda entender rápido desde el catálogo.",
            })}
          </span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label>
          <span>{localized(locale, { en: "Summary", es: "Resumen" })}</span>
          <span className="field-help">
            {localized(locale, {
              en: "Summarize what happened and why this source matters in two or three sentences.",
              es: "Resume qué pasó y por qué importa esta fuente en dos o tres oraciones.",
            })}
          </span>
          <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} />
        </label>
        <label>
          <span>{localized(locale, { en: "Context", es: "Contexto" })}</span>
          <span className="field-help">
            {localized(locale, {
              en: "Add the operational or market context that helps interpret the evidence correctly.",
              es: "Agrega el contexto operativo o de mercado que ayuda a interpretar bien la evidencia.",
            })}
          </span>
          <textarea value={context} onChange={(event) => setContext(event.target.value)} rows={5} />
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
              en: isEdit ? "Save evidence proposal" : "Submit evidence proposal",
              es: isEdit ? "Guardar propuesta de evidencia" : "Enviar propuesta de evidencia",
            })}
      </button>
    </form>
  );
}
