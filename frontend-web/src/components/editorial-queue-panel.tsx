"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  EditorialActivityListResponse,
  EditorialBulkStatusResponse,
} from "@/lib/api";
import { resolveApiErrorPayloadMessage } from "@/lib/api-errors";
import {
  type Locale,
  buildPath,
  formatAiStatus,
  formatEditorialStatus,
  localized,
} from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

type EditorialQueuePanelProps = {
  locale: Locale;
  activities: EditorialActivityListResponse;
  currentFilters: Record<string, string | undefined>;
};

const BULK_EDITORIAL_STATUSES = [
  "approved",
  "needs_correction",
  "rejected",
] as const;

export function EditorialQueuePanel({
  locale,
  activities,
  currentFilters,
}: EditorialQueuePanelProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("needs_correction");
  const [bulkOfficialAiStatus, setBulkOfficialAiStatus] = useState<string>("");
  const [rationale, setRationale] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EditorialBulkStatusResponse | null>(null);

  const totalPages =
    activities.total > 0 ? Math.ceil(activities.total / activities.pageSize) : 1;

  const allVisibleIds = useMemo(
    () => activities.items.map((item) => item.id),
    [activities.items],
  );
  const visibleReadyCount = useMemo(
    () =>
      activities.items.filter(
        (item) =>
          item.completionSignals.hasEditorialSummaryEn &&
          item.completionSignals.hasEditorialSummaryEs &&
          item.completionSignals.hasEvidence &&
          typeof item.officialAiStatus === "number",
      ).length,
    [activities.items],
  );
  const visibleMissingSummaryCount = useMemo(
    () =>
      activities.items.filter(
        (item) =>
          !item.completionSignals.hasEditorialSummaryEn ||
          !item.completionSignals.hasEditorialSummaryEs,
      ).length,
    [activities.items],
  );
  const visibleMissingEvidenceCount = useMemo(
    () => activities.items.filter((item) => !item.completionSignals.hasEvidence).length,
    [activities.items],
  );

  const allSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : allVisibleIds);
  }

  async function applyBulkAction() {
    if (selectedIds.length === 0) {
      setError(
        localized(locale, {
          en: "Select at least one activity before applying a bulk action.",
          es: "Selecciona al menos una actividad antes de aplicar una acci\u00f3n masiva.",
        }),
      );
      return;
    }

    if (!rationale.trim()) {
      setError(
        localized(locale, {
          en: "Write a rationale before applying a bulk action.",
          es: "Escribe un fundamento antes de aplicar una acci\u00f3n masiva.",
        }),
      );
      return;
    }

    setBusy(true);
    setError(null);
    setFeedback(null);
    setResult(null);

    try {
      const payload: Record<string, unknown> = {
        ids: selectedIds,
        editorialStatus: bulkStatus,
        rationale: rationale.trim(),
      };

      if (bulkStatus === "approved" && bulkOfficialAiStatus) {
        payload.officialAiStatus = Number(bulkOfficialAiStatus);
      }

      const response = await fetch(`${API_BASE_URL}/editorial/activities/bulk-status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as
        | EditorialBulkStatusResponse
        | { message?: string }
        | null;

      if (!response.ok || !body || "message" in body) {
        throw new Error(
          resolveApiErrorPayloadMessage(
            body && "message" in body ? body : null,
            locale,
            localized(locale, {
              en: "Bulk editorial action failed.",
              es: "La accion editorial masiva fallo.",
            }),
          ),
        );
      }

      const resultBody = body as EditorialBulkStatusResponse;
      setResult(resultBody);
      setFeedback(
        localized(locale, {
          en: `Bulk action completed: ${resultBody.processedCount} updated, ${resultBody.skippedCount} skipped.`,
          es: `Acci\u00f3n masiva completada: ${resultBody.processedCount} actualizadas, ${resultBody.skippedCount} omitidas.`,
        }),
      );
      setSelectedIds([]);
      setRationale("");
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : localized(locale, {
              en: "Unexpected bulk editorial error.",
              es: "Error inesperado en la acci\u00f3n editorial masiva.",
            }),
      );
    } finally {
      setBusy(false);
    }
  }

  function pageHref(page: string) {
    return buildPath("/backoffice/editorial", locale, {
      ...currentFilters,
      page,
    });
  }

  function presetHref(overrides: Record<string, string | undefined>) {
    return buildPath("/backoffice/editorial", locale, {
      ...currentFilters,
      ...overrides,
      page: "1",
    });
  }

  return (
    <div className="page-stack">
      <section className="glass-panel page-stack" data-testid="editorial-bulk-panel">
        <div className="section-header">
          <div>
            <span className="eyebrow">
              {localized(locale, { en: "Bulk editorial action", es: "Acci\u00f3n editorial masiva" })}
            </span>
            <h2>
              {localized(locale, {
                en: "Update selected activities in one move",
                es: "Actualizar actividades seleccionadas en un solo movimiento",
              })}
            </h2>
            <p className="section-copy">
              {localized(locale, {
                en: "Use this lane-level action for triage. Bulk approval still respects editorial readiness guardrails.",
                es: "Usa esta acci\u00f3n por lote para triage. La aprobaci\u00f3n masiva sigue respetando los guardrails editoriales de readiness.",
              })}
            </p>
          </div>
          <div className="profile-chips">
            <span className="tag-chip">
              {localized(locale, {
                en: `${selectedIds.length} selected`,
                es: `${selectedIds.length} seleccionadas`,
              })}
            </span>
          </div>
        </div>

        <div className="action-row">
          <button type="button" className="button button--ghost" onClick={toggleSelectAll}>
            {allSelected
              ? localized(locale, { en: "Clear visible", es: "Limpiar visibles" })
              : localized(locale, { en: "Select visible", es: "Seleccionar visibles" })}
          </button>
          {selectedIds.length > 0 ? (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setSelectedIds([])}
            >
              {localized(locale, { en: "Clear selection", es: "Limpiar selecci\u00f3n" })}
            </button>
          ) : null}
        </div>

        <div className="backoffice-metric-grid">
          <article className="metric-card">
            <strong>{activities.items.length}</strong>
            <span>{localized(locale, { en: "visible in this page", es: "visibles en esta p\u00e1gina" })}</span>
          </article>
          <article className="metric-card metric-card--positive">
            <strong>{visibleReadyCount}</strong>
            <span>{localized(locale, { en: "ready for approval", es: "listas para aprobar" })}</span>
          </article>
          <article className="metric-card">
            <strong>{visibleMissingSummaryCount}</strong>
            <span>{localized(locale, { en: "missing summaries", es: "sin res\u00famenes" })}</span>
          </article>
          <article className="metric-card">
            <strong>{visibleMissingEvidenceCount}</strong>
            <span>{localized(locale, { en: "without evidence", es: "sin evidencia" })}</span>
          </article>
        </div>

        <div className="detail-tags">
          <Link
            href={presetHref({
              status: "pending",
              hasEditorialSummary: "true",
              hasEvidence: "true",
            })}
            className="tag-chip"
          >
            {localized(locale, { en: "Ready candidates", es: "Candidatas listas" })}
          </Link>
          <Link
            href={presetHref({
              status: "pending",
              hasEditorialSummary: "false",
            })}
            className="tag-chip tag-chip--muted"
          >
            {localized(locale, { en: "Need summaries", es: "Faltan res\u00famenes" })}
          </Link>
          <Link
            href={presetHref({
              status: "pending",
              hasEvidence: "false",
            })}
            className="tag-chip tag-chip--muted"
          >
            {localized(locale, { en: "Need evidence", es: "Falta evidencia" })}
          </Link>
        </div>

        <div className="backoffice-bulk-grid">
          <label className="comment-form">
            <span>{localized(locale, { en: "Editorial status", es: "Estado editorial" })}</span>
            <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>
              {BULK_EDITORIAL_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {formatEditorialStatus(value, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="comment-form">
            <span>{localized(locale, { en: "Official AI status", es: "Estado IA oficial" })}</span>
            <select
              value={bulkOfficialAiStatus}
              onChange={(event) => setBulkOfficialAiStatus(event.target.value)}
            >
              <option value="">{localized(locale, { en: "Keep current", es: "Mantener actual" })}</option>
              {["0", "1", "2", "3", "4", "5"].map((value) => (
                <option key={value} value={value}>
                  {formatAiStatus(Number(value), locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="comment-form backoffice-bulk-grid__rationale">
            <span>{localized(locale, { en: "Rationale", es: "Fundamento" })}</span>
            <textarea
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              rows={4}
            />
          </label>
        </div>

        {feedback ? <p className="form-feedback form-feedback--success">{feedback}</p> : null}
        {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

        <button
          type="button"
          className="button button--solid"
          onClick={() => void applyBulkAction()}
          disabled={busy}
        >
          {busy
            ? localized(locale, { en: "Applying...", es: "Aplicando..." })
            : localized(locale, { en: "Apply bulk action", es: "Aplicar acci\u00f3n masiva" })}
        </button>

        {result ? (
          <div className="page-stack">
            <div className="backoffice-metric-grid">
              <article className="metric-card metric-card--positive">
                <strong>{result.processedCount}</strong>
                <span>{localized(locale, { en: "updated", es: "actualizadas" })}</span>
              </article>
              <article className="metric-card">
                <strong>{result.skippedCount}</strong>
                <span>{localized(locale, { en: "skipped", es: "omitidas" })}</span>
              </article>
              <article className="metric-card">
                <strong>{result.notFoundCount}</strong>
                <span>{localized(locale, { en: "not found", es: "no encontradas" })}</span>
              </article>
            </div>
            <div className="queue-list">
            {result.results.slice(0, 8).map((item) => (
              <article key={item.id} className="queue-report-card">
                <div className="backoffice-card__header">
                  <strong>{item.key ?? item.id}</strong>
                  <span className="tag-chip tag-chip--muted">
                    {localized(locale, { en: "Outcome", es: "Resultado" })}: {item.result}
                  </span>
                </div>
                {item.previousEditorialStatus || item.newEditorialStatus ? (
                  <span>
                    {localized(locale, { en: "Editorial state", es: "Estado editorial" })}:{" "}
                    {item.previousEditorialStatus ?? "-"}{" "}
                    {item.newEditorialStatus ? `-> ${item.newEditorialStatus}` : ""}
                  </span>
                ) : null}
                {item.reason ? <p>{item.reason}</p> : null}
              </article>
            ))}
          </div>
          </div>
        ) : null}
      </section>

      {activities.items.length ? (
        <div className="queue-list">
          {activities.items.map((item) => (
            <article key={item.id} className="backoffice-card">
              <div className="backoffice-card__header">
                <div className="backoffice-card__select">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelected(item.id)}
                    aria-label={localized(locale, {
                      en: `Select ${item.title}`,
                      es: `Seleccionar ${item.title}`,
                    })}
                  />
                  <div>
                    <h2>{item.title}</h2>
                    <p>
                      {item.key} / {item.slug}
                    </p>
                  </div>
                </div>
                <div className="profile-chips">
                  <span className="status-pill">
                    {formatEditorialStatus(item.editorialStatus, locale)}
                  </span>
                  <span className="tag-chip">{formatAiStatus(item.officialAiStatus, locale)}</span>
                </div>
              </div>
              <ul className="muted-list">
                <li>
                  {localized(locale, { en: "Evidence linked", es: "Evidencias vinculadas" })}:{" "}
                  {item.evidenceCount}
                </li>
                <li>
                  {localized(locale, { en: "Summary status", es: "Estado del resumen" })}:{" "}
                  {item.hasEditorialSummary
                    ? localized(locale, { en: "ready", es: "listo" })
                    : localized(locale, { en: "missing", es: "faltante" })}
                </li>
                <li>
                  {localized(locale, { en: "Last editorial action", es: "\u00daltima acci\u00f3n editorial" })}:{" "}
                  {item.lastEditorialActionAt
                    ? new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(item.lastEditorialActionAt))
                    : localized(locale, { en: "none yet", es: "ninguna a\u00fan" })}
                </li>
              </ul>
              <div className="detail-tags">
                {item.industryNames.map((value) => (
                  <span key={`${item.id}-industry-${value.key}`} className="tag-chip">
                    {value.name}
                  </span>
                ))}
                {item.categoryNames.map((value) => (
                  <span key={`${item.id}-category-${value.key}`} className="tag-chip tag-chip--muted">
                    {value.name}
                  </span>
                ))}
              </div>
              <div className="detail-tags">
                <span className="tag-chip tag-chip--muted">
                  {item.completionSignals.hasEditorialSummaryEn ? "EN summary" : "EN missing"}
                </span>
                <span className="tag-chip tag-chip--muted">
                  {item.completionSignals.hasEditorialSummaryEs ? "ES summary" : "ES missing"}
                </span>
                <span
                  className={
                    item.completionSignals.hasEvidence
                      ? "tag-chip"
                      : "tag-chip tag-chip--muted"
                  }
                >
                  {item.completionSignals.hasEvidence ? "Evidence ready" : "Evidence missing"}
                </span>
                <span
                  className={
                    item.completionSignals.hasEditorialSummaryEn &&
                    item.completionSignals.hasEditorialSummaryEs &&
                    item.completionSignals.hasEvidence &&
                    typeof item.officialAiStatus === "number"
                      ? "tag-chip"
                      : "tag-chip tag-chip--muted"
                  }
                >
                  {item.completionSignals.hasEditorialSummaryEn &&
                  item.completionSignals.hasEditorialSummaryEs &&
                  item.completionSignals.hasEvidence &&
                  typeof item.officialAiStatus === "number"
                    ? localized(locale, { en: "Ready for approval", es: "Lista para aprobar" })
                    : localized(locale, { en: "Needs editor input", es: "Requiere trabajo editorial" })}
                </span>
              </div>
              <div className="action-row">
                <Link
                  href={buildPath(`/backoffice/editorial/activities/${item.id}`, locale, {
                    ...currentFilters,
                    page: String(activities.page),
                  })}
                  className="button button--solid"
                >
                  {localized(locale, {
                    en: "Open workspace",
                    es: "Abrir workspace",
                  })}
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-panel">
          <p>
            {localized(locale, {
              en: "No activities match this editorial status right now.",
              es: "No hay actividades con este estado editorial ahora mismo.",
            })}
          </p>
        </div>
      )}

      {activities.total > activities.pageSize ? (
        <div className="pagination-row">
          <Link
            href={pageHref(activities.page > 1 ? String(activities.page - 1) : "1")}
            className={activities.page > 1 ? "button button--ghost" : "button button--ghost is-disabled"}
            aria-disabled={activities.page <= 1}
          >
            {localized(locale, { en: "Previous", es: "Anterior" })}
          </Link>
          <span className="pagination-copy">
            {localized(locale, {
              en: `Page ${activities.page} of ${totalPages}`,
              es: `PÃ¡gina ${activities.page} de ${totalPages}`,
            })}
          </span>
          <Link
            href={pageHref(
              activities.page < totalPages ? String(activities.page + 1) : String(totalPages),
            )}
            className={
              activities.page < totalPages
                ? "button button--ghost"
                : "button button--ghost is-disabled"
            }
            aria-disabled={activities.page >= totalPages}
          >
            {localized(locale, { en: "Next", es: "Siguiente" })}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

