"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  EditorialCatalogActivityDetail,
  EditorialCatalogReferences,
} from "@/lib/api";
import { resolveApiErrorPayloadMessage } from "@/lib/api-errors";
import {
  type Locale,
  buildPath,
  formatAiStatus,
  formatEditorialStatus,
  formatGranularity,
  localized,
} from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

const GRANULARITIES = ["tarea", "funcion", "rol", "profesion"] as const;
const EDITORIAL_STATUSES = [
  "pending",
  "approved",
  "needs_correction",
  "rejected",
  "archived",
] as const;

type ActivityAdminFormProps = {
  locale: Locale;
  mode: "create" | "edit";
  references: EditorialCatalogReferences;
  initialData?: EditorialCatalogActivityDetail;
};

export function ActivityAdminForm({
  locale,
  mode,
  references,
  initialData,
}: ActivityAdminFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [granularity, setGranularity] = useState(initialData?.granularity ?? "tarea");
  const [officialAiStatus, setOfficialAiStatus] = useState(
    initialData?.officialAiStatus === null || initialData?.officialAiStatus === undefined
      ? ""
      : String(initialData.officialAiStatus),
  );
  const [editorialStatus, setEditorialStatus] = useState(
    initialData?.editorialStatus ?? "pending",
  );
  const [industryKeys, setIndustryKeys] = useState<string[]>(initialData?.industryKeys ?? []);
  const [categoryKeys, setCategoryKeys] = useState<string[]>(initialData?.categoryKeys ?? []);
  const [titleEn, setTitleEn] = useState(initialData?.translations.en.title ?? "");
  const [titleEs, setTitleEs] = useState(initialData?.translations.es.title ?? "");
  const [shortEn, setShortEn] = useState(initialData?.translations.en.shortDescription ?? "");
  const [shortEs, setShortEs] = useState(initialData?.translations.es.shortDescription ?? "");
  const [fullEn, setFullEn] = useState(initialData?.translations.en.fullDescription ?? "");
  const [fullEs, setFullEs] = useState(initialData?.translations.es.fullDescription ?? "");
  const [summaryEn, setSummaryEn] = useState(
    initialData?.translations.en.editorialSummary ?? "",
  );
  const [summaryEs, setSummaryEs] = useState(
    initialData?.translations.es.editorialSummary ?? "",
  );
  const [slugEn, setSlugEn] = useState(initialData?.translations.en.slug ?? "");
  const [slugEs, setSlugEs] = useState(initialData?.translations.es.slug ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sortedIndustries = useMemo(
    () =>
      [...references.industries].sort((left, right) =>
        left.name.localeCompare(right.name, locale, {
          sensitivity: "base",
          ignorePunctuation: true,
        }),
      ),
    [locale, references.industries],
  );
  const sortedCategories = useMemo(
    () =>
      [...references.categories].sort((left, right) =>
        left.name.localeCompare(right.name, locale, {
          sensitivity: "base",
          ignorePunctuation: true,
        }),
      ),
    [locale, references.categories],
  );

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

  async function submit() {
    setBusy(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(
        isEdit && initialData
          ? `${API_BASE_URL}/editorial/catalog/activities/${initialData.id}`
          : `${API_BASE_URL}/editorial/catalog/activities`,
        {
          method: isEdit ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            granularity,
            officialAiStatus: officialAiStatus === "" ? null : Number(officialAiStatus),
            editorialStatus,
            industryKeys,
            categoryKeys,
            translations: {
              en: {
                title: titleEn,
                shortDescription: shortEn,
                fullDescription: fullEn,
                editorialSummary: summaryEn,
                slug: slugEn,
              },
              es: {
                title: titleEs,
                shortDescription: shortEs,
                fullDescription: fullEs,
                editorialSummary: summaryEs,
                slug: slugEs,
              },
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
              en: "Could not save the activity.",
              es: "No se pudo guardar la actividad.",
            }),
          ),
        );
      }

      setFeedback(
        localized(locale, {
          en: isEdit ? "Activity updated." : "Activity created.",
          es: isEdit ? "Actividad actualizada." : "Actividad creada.",
        }),
      );

      if (!isEdit && body?.id) {
        router.push(buildPath(`/backoffice/activities/${body.id}`, locale));
        return;
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected activity save error.",
              es: "Error inesperado al guardar la actividad.",
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
        `${API_BASE_URL}/editorial/catalog/activities/${initialData.id}/status`,
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
              en: "Could not update the activity status.",
              es: "No se pudo actualizar el estado de la actividad.",
            }),
          ),
        );
      }

      setEditorialStatus(nextStatus);
      setFeedback(
        localized(locale, {
          en: "Activity status updated.",
          es: "Estado de la actividad actualizado.",
        }),
      );
      router.refresh();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : localized(locale, {
              en: "Unexpected status error.",
              es: "Error inesperado al actualizar el estado.",
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
                en: isEdit ? "Edit activity" : "New activity",
                es: isEdit ? "Editar actividad" : "Nueva actividad",
              })}
            </span>
            <h1 className="section-title">
              {isEdit
                ? initialData?.title
                : localized(locale, { en: "Create an activity", es: "Crear una actividad" })}
            </h1>
            <p className="section-copy">
              {localized(locale, {
                en: "Manage bilingual source content, taxonomies and publication state from backoffice.",
                es: "Gestiona contenido bilingüe, taxonomías y estado de publicación desde backoffice.",
              })}
            </p>
          </div>
          {isEdit && initialData ? (
            <div className="page-stack" style={{ alignItems: "flex-end", gap: "0.5rem" }}>
              <span className="tag-chip">{initialData.key}</span>
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
          <span className="eyebrow">
            {localized(locale, { en: "Identity", es: "Identidad" })}
          </span>
          <h2>{localized(locale, { en: "Core fields", es: "Campos base" })}</h2>
        </div>

        <div className="crud-grid crud-grid--three">
          <label className="comment-form">
            <span>{localized(locale, { en: "Granularity", es: "Granularidad" })}</span>
            <select value={granularity} onChange={(event) => setGranularity(event.target.value)}>
              {GRANULARITIES.map((value) => (
                <option key={value} value={value}>
                  {formatGranularity(value, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="comment-form">
            <span>{localized(locale, { en: "Official AI status", es: "Estado IA oficial" })}</span>
            <select
              value={officialAiStatus}
              onChange={(event) => setOfficialAiStatus(event.target.value)}
            >
              <option value="">{localized(locale, { en: "Unset", es: "Sin definir" })}</option>
              {["0", "1", "2", "3", "4", "5"].map((value) => (
                <option key={value} value={value}>
                  {formatAiStatus(Number(value), locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="comment-form">
            <span>{localized(locale, { en: "Publication state", es: "Estado de publicación" })}</span>
            <select
              value={editorialStatus}
              onChange={(event) => setEditorialStatus(event.target.value)}
            >
              {EDITORIAL_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {formatEditorialStatus(value, locale)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">{localized(locale, { en: "Taxonomies", es: "Taxonomías" })}</span>
          <h2>{localized(locale, { en: "Classification", es: "Clasificación" })}</h2>
        </div>

        <div className="taxonomy-section">
          <div className="taxonomy-section__header">
            <span className="eyebrow">{localized(locale, { en: "Industries", es: "Rubros" })}</span>
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
              {localized(locale, { en: "Functional categories", es: "Categorías funcionales" })}
            </span>
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
          <span className="eyebrow">EN</span>
          <h2>{localized(locale, { en: "English source content", es: "Contenido fuente en inglés" })}</h2>
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
            <span>{localized(locale, { en: "Short description", es: "Descripción corta" })}</span>
            <textarea value={shortEn} onChange={(event) => setShortEn(event.target.value)} rows={3} />
          </label>
          <label className="comment-form crud-grid__full">
            <span>{localized(locale, { en: "Full description", es: "Descripción completa" })}</span>
            <textarea value={fullEn} onChange={(event) => setFullEn(event.target.value)} rows={5} />
          </label>
          <label className="comment-form crud-grid__full">
            <span>{localized(locale, { en: "Editorial summary", es: "Resumen editorial" })}</span>
            <textarea value={summaryEn} onChange={(event) => setSummaryEn(event.target.value)} rows={3} />
          </label>
        </div>
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">ES</span>
          <h2>{localized(locale, { en: "Spanish source content", es: "Contenido fuente en español" })}</h2>
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
            <span>{localized(locale, { en: "Short description", es: "Descripción corta" })}</span>
            <textarea value={shortEs} onChange={(event) => setShortEs(event.target.value)} rows={3} />
          </label>
          <label className="comment-form crud-grid__full">
            <span>{localized(locale, { en: "Full description", es: "Descripción completa" })}</span>
            <textarea value={fullEs} onChange={(event) => setFullEs(event.target.value)} rows={5} />
          </label>
          <label className="comment-form crud-grid__full">
            <span>{localized(locale, { en: "Editorial summary", es: "Resumen editorial" })}</span>
            <textarea value={summaryEs} onChange={(event) => setSummaryEs(event.target.value)} rows={3} />
          </label>
        </div>
      </section>

      {isEdit && initialData?.evidences.length ? (
        <section className="glass-panel page-stack">
          <div>
            <span className="eyebrow">
              {localized(locale, { en: "Linked evidence", es: "Evidencia vinculada" })}
            </span>
            <h2>{localized(locale, { en: "Current relationships", es: "Relaciones actuales" })}</h2>
          </div>
          <div className="related-links">
            {initialData.evidences.map((item) => (
              <Link
                key={item.id}
                href={buildPath(`/backoffice/evidence/${item.id}`, locale)}
                className="related-link"
              >
                <strong>{item.title}</strong>
                <span>{formatEditorialStatus(item.editorialStatus, locale)}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="action-row">
        <Link href={buildPath("/backoffice/activities", locale)} className="button button--ghost">
          {localized(locale, { en: "Back to activities", es: "Volver a actividades" })}
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
            : localized(locale, { en: "Save activity", es: "Guardar actividad" })}
        </button>
      </div>
    </div>
  );
}
