"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  EditorialCatalogEvidenceDetail,
  EditorialCatalogReferences,
} from "@/lib/api";
import { resolveApiErrorPayloadMessage } from "@/lib/api-errors";
import { type Locale, buildPath, formatEditorialStatus, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

const EDITORIAL_STATUSES = [
  "pending",
  "approved",
  "needs_correction",
  "rejected",
  "archived",
] as const;

const RELIABILITY_FLAGS = ["normal", "outdated", "low_confidence", "archived"] as const;

type EvidenceAdminFormProps = {
  locale: Locale;
  mode: "create" | "edit";
  references: EditorialCatalogReferences;
  initialData?: EditorialCatalogEvidenceDetail;
};

export function EvidenceAdminForm({
  locale,
  mode,
  references,
  initialData,
}: EvidenceAdminFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [type, setType] = useState(initialData?.type ?? "official_source");
  const [editorialStatus, setEditorialStatus] = useState(
    initialData?.editorialStatus ?? "pending",
  );
  const [reliabilityFlag, setReliabilityFlag] = useState(
    initialData?.reliabilityFlag ?? "normal",
  );
  const [sourceText, setSourceText] = useState(initialData?.sourceText ?? "");
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl ?? "");
  const [eventDate, setEventDate] = useState(
    initialData?.eventDate ? initialData.eventDate.slice(0, 10) : "",
  );
  const [activityIds, setActivityIds] = useState<string[]>(initialData?.activityIds ?? []);
  const [activityQuery, setActivityQuery] = useState("");
  const [titleEn, setTitleEn] = useState(initialData?.translations.en.title ?? "");
  const [titleEs, setTitleEs] = useState(initialData?.translations.es.title ?? "");
  const [summaryEn, setSummaryEn] = useState(initialData?.translations.en.summary ?? "");
  const [summaryEs, setSummaryEs] = useState(initialData?.translations.es.summary ?? "");
  const [contextEn, setContextEn] = useState(initialData?.translations.en.context ?? "");
  const [contextEs, setContextEs] = useState(initialData?.translations.es.context ?? "");
  const [slugEn, setSlugEn] = useState(initialData?.translations.en.slug ?? "");
  const [slugEs, setSlugEs] = useState(initialData?.translations.es.slug ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filteredActivities = useMemo(() => {
    const term = activityQuery.trim().toLowerCase();
    const sorted = [...references.activities].sort((left, right) =>
      left.title.localeCompare(right.title, locale, {
        sensitivity: "base",
        ignorePunctuation: true,
      }),
    );
    if (!term) return sorted;
    return sorted.filter(
      (item) =>
        item.title.toLowerCase().includes(term) || item.key.toLowerCase().includes(term),
    );
  }, [activityQuery, locale, references.activities]);

  function toggleActivity(id: string) {
    setActivityIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function submit() {
    setBusy(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(
        isEdit && initialData
          ? `${API_BASE_URL}/editorial/catalog/evidence/${initialData.id}`
          : `${API_BASE_URL}/editorial/catalog/evidence`,
        {
          method: isEdit ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            editorialStatus,
            reliabilityFlag,
            sourceText,
            sourceUrl,
            eventDate: eventDate || null,
            activityIds,
            translations: {
              en: { title: titleEn, summary: summaryEn, context: contextEn, slug: slugEn },
              es: { title: titleEs, summary: summaryEs, context: contextEs, slug: slugEs },
            },
          }),
        },
      );

      const body = (await response.json().catch(() => null)) as
        | { message?: string; id?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          resolveApiErrorPayloadMessage(
            body ?? null,
            locale,
            localized(locale, {
              en: "Could not save the evidence.",
              es: "No se pudo guardar la evidencia.",
            }),
          ),
        );
      }

      setFeedback(
        localized(locale, {
          en: isEdit ? "Evidence updated." : "Evidence created.",
          es: isEdit ? "Evidencia actualizada." : "Evidencia creada.",
        }),
      );

      if (!isEdit && body?.id) {
        router.push(buildPath(`/backoffice/evidence/${body.id}`, locale));
        return;
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected evidence save error.",
              es: "Error inesperado al guardar la evidencia.",
            }),
      );
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(nextStatus: string) {
    if (!initialData) return;
    setBusy(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/editorial/catalog/evidence/${initialData.id}/status`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editorialStatus: nextStatus }),
        },
      );

      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(
          resolveApiErrorPayloadMessage(
            body ?? null,
            locale,
            localized(locale, {
              en: "Could not update the evidence status.",
              es: "No se pudo actualizar el estado de la evidencia.",
            }),
          ),
        );
      }

      setEditorialStatus(nextStatus);
      setFeedback(
        localized(locale, {
          en: "Evidence status updated.",
          es: "Estado de la evidencia actualizado.",
        }),
      );
      router.refresh();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : localized(locale, {
              en: "Unexpected evidence status error.",
              es: "Error inesperado al actualizar el estado de la evidencia.",
            }),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="proposal-form">
      <section className="glass-panel page-stack">
        <div className="section-header">
          <div>
            <span className="eyebrow">
              {localized(locale, {
                en: isEdit ? "Edit evidence" : "New evidence",
                es: isEdit ? "Editar evidencia" : "Nueva evidencia",
              })}
            </span>
            <h1 className="section-title">
              {isEdit
                ? initialData?.title
                : localized(locale, { en: "Create an evidence item", es: "Crear una evidencia" })}
            </h1>
          </div>
          {isEdit && initialData ? (
            <div className="page-stack" style={{ alignItems: "flex-end", gap: "0.5rem" }}>
              {initialData.key ? <span className="tag-chip">{initialData.key}</span> : null}
              <span className="tag-chip tag-chip--muted">
                {formatEditorialStatus(editorialStatus, locale)}
              </span>
            </div>
          ) : null}
        </div>

        {feedback ? <p className="form-feedback form-feedback--success">{feedback}</p> : null}
        {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">{localized(locale, { en: "Metadata", es: "Metadatos" })}</span>
          <h2>{localized(locale, { en: "Core fields", es: "Campos base" })}</h2>
        </div>

        <div className="crud-grid crud-grid--three">
          <label className="comment-form">
            <span>{localized(locale, { en: "Type", es: "Tipo" })}</span>
            <input value={type} onChange={(event) => setType(event.target.value)} />
          </label>
          <label className="comment-form">
            <span>{localized(locale, { en: "Publication state", es: "Estado de publicación" })}</span>
            <select value={editorialStatus} onChange={(event) => setEditorialStatus(event.target.value)}>
              {EDITORIAL_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {formatEditorialStatus(value, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="comment-form">
            <span>{localized(locale, { en: "Reliability", es: "Confiabilidad" })}</span>
            <select value={reliabilityFlag} onChange={(event) => setReliabilityFlag(event.target.value)}>
              {RELIABILITY_FLAGS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="crud-grid">
          <label className="comment-form crud-grid__full">
            <span>{localized(locale, { en: "Source text", es: "Fuente" })}</span>
            <textarea value={sourceText} onChange={(event) => setSourceText(event.target.value)} rows={3} />
          </label>
          <label className="comment-form">
            <span>URL</span>
            <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
          </label>
          <label className="comment-form">
            <span>{localized(locale, { en: "Event date", es: "Fecha del evento" })}</span>
            <input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">{localized(locale, { en: "Related activities", es: "Actividades relacionadas" })}</span>
          <h2>{localized(locale, { en: "Relationships", es: "Relaciones" })}</h2>
        </div>
        <label className="comment-form">
          <span>{localized(locale, { en: "Search activities", es: "Buscar actividades" })}</span>
          <input
            type="search"
            value={activityQuery}
            onChange={(event) => setActivityQuery(event.target.value)}
            placeholder={localized(locale, { en: "Title or key", es: "Título o clave" })}
          />
        </label>
        <div className="checkbox-grid">
          {filteredActivities.slice(0, 120).map((item) => (
            <label key={item.id} className="checkbox-card">
              <input
                type="checkbox"
                checked={activityIds.includes(item.id)}
                onChange={() => toggleActivity(item.id)}
              />
              <span>{item.title}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">EN</span>
          <h2>{localized(locale, { en: "English content", es: "Contenido en inglés" })}</h2>
        </div>
        <div className="crud-grid">
          <label className="comment-form">
            <span>{localized(locale, { en: "Title", es: "Título" })}</span>
            <input value={titleEn} onChange={(event) => setTitleEn(event.target.value)} />
          </label>
          <label className="comment-form">
            <span>Slug</span>
            <input value={slugEn} onChange={(event) => setSlugEn(event.target.value)} />
          </label>
          <label className="comment-form crud-grid__full">
            <span>Summary</span>
            <textarea value={summaryEn} onChange={(event) => setSummaryEn(event.target.value)} rows={3} />
          </label>
          <label className="comment-form crud-grid__full">
            <span>Context</span>
            <textarea value={contextEn} onChange={(event) => setContextEn(event.target.value)} rows={4} />
          </label>
        </div>
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">ES</span>
          <h2>{localized(locale, { en: "Spanish content", es: "Contenido en español" })}</h2>
        </div>
        <div className="crud-grid">
          <label className="comment-form">
            <span>{localized(locale, { en: "Title", es: "Título" })}</span>
            <input value={titleEs} onChange={(event) => setTitleEs(event.target.value)} />
          </label>
          <label className="comment-form">
            <span>Slug</span>
            <input value={slugEs} onChange={(event) => setSlugEs(event.target.value)} />
          </label>
          <label className="comment-form crud-grid__full">
            <span>Summary</span>
            <textarea value={summaryEs} onChange={(event) => setSummaryEs(event.target.value)} rows={3} />
          </label>
          <label className="comment-form crud-grid__full">
            <span>Context</span>
            <textarea value={contextEs} onChange={(event) => setContextEs(event.target.value)} rows={4} />
          </label>
        </div>
      </section>

      <div className="action-row">
        <Link href={buildPath("/backoffice/evidence", locale)} className="button button--ghost">
          {localized(locale, { en: "Back to evidence", es: "Volver a evidencias" })}
        </Link>
        {isEdit && initialData ? (
          <>
            <button
              type="button"
              className="button button--ghost"
              disabled={busy}
              onClick={() => void setStatus("archived")}
            >
              {localized(locale, { en: "Archive", es: "Archivar" })}
            </button>
            <button
              type="button"
              className="button button--ghost"
              disabled={busy}
              onClick={() => void setStatus("approved")}
            >
              {localized(locale, { en: "Publish", es: "Publicar" })}
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="button button--solid"
          disabled={busy}
          onClick={() => void submit()}
        >
          {busy
            ? localized(locale, { en: "Saving...", es: "Guardando..." })
            : localized(locale, { en: "Save evidence", es: "Guardar evidencia" })}
        </button>
      </div>
    </div>
  );
}
