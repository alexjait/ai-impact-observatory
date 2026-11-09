"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import {
  type ModerationActivityProposalDetail,
  type ModerationQueueActivityItem,
  type ModerationQueueActivityProposalItem,
  type ModerationQueueCommentItem,
  type ModerationQueueEvidenceProposalItem,
  type ModerationQueueResponse,
  type ModerationQueueType,
  type ModerationEvidenceProposalDetail,
} from "@/lib/api";
import { resolveApiErrorPayloadMessage } from "@/lib/api-errors";
import {
  type Locale,
  formatAiStatus,
  buildPath,
  formatEditorialStatus,
  formatGranularity,
  localized,
} from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

type ModerationQueuePanelProps = {
  locale: Locale;
  queue: ModerationQueueResponse;
  editorialPath: string;
  currentStatus?: string;
  currentQuery?: string;
};

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatCommentTarget(item: ModerationQueueCommentItem, locale: Locale) {
  if (item.target.activity) {
    return localized(locale, {
      en: `Activity: ${item.target.activity.title} (${item.target.activity.key})`,
      es: `Actividad: ${item.target.activity.title} (${item.target.activity.key})`,
    });
  }

  if (item.target.evidence) {
    return localized(locale, {
      en: `Evidence: ${item.target.evidence.title}`,
      es: `Evidencia: ${item.target.evidence.title}`,
    });
  }

  return localized(locale, {
    en: "Target context unavailable",
    es: "Contexto del destino no disponible",
  });
}

function getCommentTargetHref(item: ModerationQueueCommentItem, locale: Locale) {
  if (item.target.activity?.slug) {
    return buildPath(`/activities/${item.target.activity.slug}`, locale);
  }

  if (item.target.evidence?.slug) {
    return buildPath(`/evidence/${item.target.evidence.slug}`, locale);
  }

  return null;
}

export function ModerationQueuePanel({
  locale,
  queue,
  editorialPath,
  currentStatus,
  currentQuery,
}: ModerationQueuePanelProps) {
  const router = useRouter();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queryDraft, setQueryDraft] = useState(currentQuery ?? "");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<
    Record<string, ModerationActivityProposalDetail | ModerationEvidenceProposalDetail>
  >({});

  const queueTypes = useMemo(
    () =>
      [
        {
          key: "activity_proposals",
          label: localized(locale, {
            en: "Activity proposals",
            es: "Propuestas de actividad",
          }),
        },
        {
          key: "evidence_proposals",
          label: localized(locale, {
            en: "Evidence proposals",
            es: "Propuestas de evidencia",
          }),
        },
        {
          key: "comments",
          label: localized(locale, {
            en: "Comment reports",
            es: "Denuncias de comentarios",
          }),
        },
        {
          key: "activities",
          label: localized(locale, {
            en: "Seed activities",
            es: "Actividades del seed",
          }),
        },
      ] satisfies Array<{ key: ModerationQueueType; label: string }>,
    [locale],
  );

  const statusOptions = useMemo(() => {
    if (queue.type === "comments") {
      return ["reported", "under_review", "resolved"];
    }

    return ["pending", "needs_correction", "approved", "rejected"];
  }, [queue.type]);

  const totalPages = queue.total > 0 ? Math.ceil(queue.total / queue.pageSize) : 1;

  async function runAction(path: string, reasonKey: string, successMessage: string) {
    const reason = reasons[reasonKey]?.trim();
    if (!reason) {
      setError(
        localized(locale, {
          en: "Write a rationale before applying moderation.",
          es: "Escribe un fundamento antes de aplicar moderación.",
        }),
      );
      return;
    }

    setBusyKey(reasonKey);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const body = (await response.json().catch(() => null)) as
        | { code?: string; message?: string | string[] }
        | null;

      if (!response.ok) {
        throw new Error(
          resolveApiErrorPayloadMessage(
            body,
            locale,
            localized(locale, {
              en: "Moderation action failed.",
              es: "La acción de moderación falló.",
            }),
          ),
        );
      }

      setFeedback(successMessage);
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : localized(locale, {
              en: "Unexpected moderation error.",
              es: "Error inesperado de moderación.",
            }),
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function toggleDetail(
    type: "activity_proposals" | "evidence_proposals",
    id: string,
  ) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    if (detailCache[id]) {
      setExpandedId(id);
      return;
    }

    setBusyKey(`detail:${id}`);
    setError(null);

    try {
      const endpoint =
        type === "activity_proposals"
          ? `/moderation/activities/${id}?locale=${locale}`
          : `/moderation/evidence/${id}?locale=${locale}`;
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: "include",
      });
      const body = (await response.json().catch(() => null)) as
        | ModerationActivityProposalDetail
        | ModerationEvidenceProposalDetail
        | { code?: string; message?: string | string[] }
        | null;

      if (!response.ok || !body || "message" in body) {
        throw new Error(
          resolveApiErrorPayloadMessage(
            body && "message" in body ? body : null,
            locale,
            localized(locale, {
              en: "Could not load proposal detail.",
              es: "No se pudo cargar el detalle de la propuesta.",
            }),
          ),
        );
      }

      const detail = body as
        | ModerationActivityProposalDetail
        | ModerationEvidenceProposalDetail;
      setDetailCache((current) => ({ ...current, [id]: detail }));
      setExpandedId(id);
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : localized(locale, {
              en: "Unexpected detail error.",
              es: "Error inesperado al cargar detalle.",
            }),
      );
    } finally {
      setBusyKey(null);
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(
      buildPath("/backoffice/moderation", locale, {
        type: queue.type,
        status: currentStatus,
        q: queryDraft.trim() || undefined,
        page: "1",
      }),
    );
  }

  function filterHref(status?: string, page = "1") {
    return buildPath("/backoffice/moderation", locale, {
      type: queue.type,
      status,
      q: currentQuery,
      page,
    });
  }

  return (
    <section className="glass-panel page-stack">
      <div className="section-header">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Moderation queue", es: "Cola de moderación" })}
          </span>
          <h1 className="section-title">
            {localized(locale, {
              en: "Community and submission review",
              es: "Revisión de comunidad y envíos",
            })}
          </h1>
          <p className="section-copy">
            {localized(locale, {
              en: "Move through one queue at a time, leave explicit rationale and keep editorial follow-up tight.",
              es: "Recorre una cola por vez, deja fundamentos explícitos y mantén el seguimiento editorial bien ajustado.",
            })}
          </p>
        </div>
      </div>

      <div className="tab-row">
        {queueTypes.map((item) => (
          <Link
            key={item.key}
            href={buildPath("/backoffice/moderation", locale, {
              type: item.key,
              q: currentQuery,
              page: "1",
            })}
            className={queue.type === item.key ? "tab-chip tab-chip--active" : "tab-chip"}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="tab-row">
        <Link
          href={filterHref(undefined)}
          className={!currentStatus ? "tab-chip tab-chip--active" : "tab-chip"}
        >
          {localized(locale, { en: "All visible", es: "Todo lo visible" })}
        </Link>
        {statusOptions.map((status) => (
          <Link
            key={status}
            href={filterHref(status)}
            className={currentStatus === status ? "tab-chip tab-chip--active" : "tab-chip"}
          >
            {formatEditorialStatus(status, locale)}
          </Link>
        ))}
      </div>

      <form className="backoffice-search" onSubmit={submitSearch}>
        <label className="comment-form">
          <span>
            {localized(locale, {
              en: "Search inside this lane",
              es: "Buscar dentro de esta cola",
            })}
          </span>
          <input
            type="search"
            value={queryDraft}
            onChange={(event) => setQueryDraft(event.target.value)}
            placeholder={localized(locale, {
              en: "Title, author, rationale, source or comment text",
              es: "Título, autor, fundamento, fuente o texto del comentario",
            })}
          />
        </label>
        <div className="action-row">
          <button type="submit" className="button button--solid">
            {localized(locale, { en: "Search", es: "Buscar" })}
          </button>
          {currentQuery ? (
            <Link
              href={buildPath("/backoffice/moderation", locale, {
                type: queue.type,
                status: currentStatus,
                page: "1",
              })}
              className="button button--ghost"
            >
              {localized(locale, { en: "Clear", es: "Limpiar" })}
            </Link>
          ) : null}
        </div>
      </form>

      <div className="backoffice-meta">
        <span>
          {localized(locale, {
            en: `${queue.total} items in this view`,
            es: `${queue.total} elementos en esta vista`,
          })}
        </span>
        <span>
          {localized(locale, {
            en: `Page ${queue.page} of ${totalPages}`,
            es: `Página ${queue.page} de ${totalPages}`,
          })}
        </span>
      </div>

      {feedback ? <p className="form-feedback form-feedback--success">{feedback}</p> : null}
      {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

      {queue.items.length > 0 ? (
        <div className="queue-list">
          {queue.type === "activity_proposals"
            ? (queue.items as ModerationQueueActivityProposalItem[]).map((item) => (
                <article key={item.id} className="backoffice-card">
                  <div className="backoffice-card__header">
                    <div>
                      <h2>{item.title}</h2>
                      <p>
                        {item.author.displayName} / {item.author.email}
                      </p>
                    </div>
                    <div className="profile-chips">
                      <span className="status-pill">
                        {formatEditorialStatus(item.status, locale)}
                      </span>
                      <span className="tag-chip tag-chip--muted">
                        {formatGranularity(item.granularity, locale)}
                      </span>
                      <span className="tag-chip tag-chip--muted">
                        {formatDate(item.createdAt, locale)}
                      </span>
                    </div>
                  </div>
                  <div className="detail-tags">
                    {item.industryKeys.map((value) => (
                      <span key={`${item.id}-industry-${value}`} className="tag-chip">
                        {value}
                      </span>
                    ))}
                    {item.categoryKeys.map((value) => (
                      <span key={`${item.id}-category-${value}`} className="tag-chip tag-chip--muted">
                        {value}
                      </span>
                    ))}
                  </div>
                  {item.translationPreview.en?.shortDescription ? (
                    <p className="section-copy">{item.translationPreview.en.shortDescription}</p>
                  ) : null}
                  <p className="section-copy">
                    {item.moderationNote ??
                      localized(locale, {
                        en: "No moderator note has been recorded yet for this proposal.",
                        es: "Todavía no hay nota del moderador para esta propuesta.",
                      })}
                  </p>
                  <label className="comment-form">
                    <span>{localized(locale, { en: "Moderator note", es: "Nota del moderador" })}</span>
                    <textarea
                      value={reasons[item.id] ?? ""}
                      onChange={(event) =>
                        setReasons((current) => ({ ...current, [item.id]: event.target.value }))
                      }
                      rows={3}
                    />
                  </label>
                  <div className="action-row">
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => void toggleDetail("activity_proposals", item.id)}
                      disabled={busyKey === `detail:${item.id}`}
                    >
                      {expandedId === item.id
                        ? localized(locale, { en: "Hide detail", es: "Ocultar detalle" })
                        : busyKey === `detail:${item.id}`
                          ? localized(locale, { en: "Loading...", es: "Cargando..." })
                          : localized(locale, { en: "Inspect detail", es: "Ver detalle" })}
                    </button>
                    <button
                      type="button"
                      className="button button--solid"
                      onClick={() =>
                        void runAction(
                          `/moderation/activities/${item.id}/approve`,
                          item.id,
                          localized(locale, {
                            en: "Activity proposal approved.",
                            es: "Propuesta de actividad aprobada.",
                          }),
                        )
                      }
                      disabled={busyKey === item.id}
                    >
                      {localized(locale, { en: "Approve", es: "Aprobar" })}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() =>
                        void runAction(
                          `/moderation/activities/${item.id}/request-correction`,
                          item.id,
                          localized(locale, {
                            en: "Correction requested.",
                            es: "Correccion solicitada.",
                          }),
                        )
                      }
                      disabled={busyKey === item.id}
                    >
                      {localized(locale, { en: "Request correction", es: "Pedir corrección" })}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() =>
                        void runAction(
                          `/moderation/activities/${item.id}/reject`,
                          item.id,
                          localized(locale, {
                            en: "Activity proposal rejected.",
                            es: "Propuesta de actividad rechazada.",
                          }),
                        )
                      }
                      disabled={busyKey === item.id}
                    >
                      {localized(locale, { en: "Reject", es: "Rechazar" })}
                    </button>
                  </div>
                  {expandedId === item.id && detailCache[item.id] ? (
                    <div className="backoffice-inline-detail">
                      {(() => {
                        const detail = detailCache[item.id] as ModerationActivityProposalDetail;

                        return (
                          <>
                            <div className="grid-two backoffice-grid">
                              <article className="queue-report-card">
                                <strong>EN</strong>
                                <span>{detail.translations.en.title ?? "-"}</span>
                                <span className="eyebrow">
                                  {localized(locale, {
                                    en: "Short description",
                                    es: "Descripción corta",
                                  })}
                                </span>
                                <p>{detail.translations.en.shortDescription ?? "-"}</p>
                                <span className="eyebrow">
                                  {localized(locale, {
                                    en: "Full description",
                                    es: "Descripción completa",
                                  })}
                                </span>
                                <p>{detail.translations.en.fullDescription ?? "-"}</p>
                              </article>
                              <article className="queue-report-card">
                                <strong>ES</strong>
                                <span>{detail.translations.es.title ?? "-"}</span>
                                <span className="eyebrow">
                                  {localized(locale, {
                                    en: "Short description",
                                    es: "Descripción corta",
                                  })}
                                </span>
                                <p>{detail.translations.es.shortDescription ?? "-"}</p>
                                <span className="eyebrow">
                                  {localized(locale, {
                                    en: "Full description",
                                    es: "Descripción completa",
                                  })}
                                </span>
                                <p>{detail.translations.es.fullDescription ?? "-"}</p>
                              </article>
                            </div>
                            <div className="detail-tags">
                              {detail.industries.map((value) => (
                                <span key={`${item.id}-industry-name-${value.key}`} className="tag-chip">
                                  {value.name}
                                </span>
                              ))}
                              {detail.categories.map((value) => (
                                <span
                                  key={`${item.id}-category-name-${value.key}`}
                                  className="tag-chip tag-chip--muted"
                                >
                                  {value.name}
                                </span>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : null}
                </article>
              ))
            : null}

          {queue.type === "evidence_proposals"
            ? (queue.items as ModerationQueueEvidenceProposalItem[]).map((item) => (
                <article key={item.id} className="backoffice-card">
                  <div className="backoffice-card__header">
                    <div>
                      <h2>{item.title}</h2>
                      <p>
                        {item.author.displayName} / {item.author.email}
                      </p>
                    </div>
                    <div className="profile-chips">
                      <span className="status-pill">
                        {formatEditorialStatus(item.status, locale)}
                      </span>
                      <span className="tag-chip tag-chip--muted">{item.type}</span>
                      <span className="tag-chip tag-chip--muted">
                        {formatDate(item.createdAt, locale)}
                      </span>
                    </div>
                  </div>
                  <p className="section-copy">{item.sourceText}</p>
                  <div className="detail-tags">
                    {item.activityKeys.map((value) => (
                      <span key={`${item.id}-activity-${value}`} className="tag-chip">
                        {value}
                      </span>
                    ))}
                  </div>
                  <p className="section-copy">
                    {item.moderationNote ??
                      localized(locale, {
                        en: "No moderator note has been recorded yet for this proposal.",
                        es: "Todavía no hay nota del moderador para esta propuesta.",
                      })}
                  </p>
                  <label className="comment-form">
                    <span>{localized(locale, { en: "Moderator note", es: "Nota del moderador" })}</span>
                    <textarea
                      value={reasons[item.id] ?? ""}
                      onChange={(event) =>
                        setReasons((current) => ({ ...current, [item.id]: event.target.value }))
                      }
                      rows={3}
                    />
                  </label>
                  <div className="action-row">
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => void toggleDetail("evidence_proposals", item.id)}
                      disabled={busyKey === `detail:${item.id}`}
                    >
                      {expandedId === item.id
                        ? localized(locale, { en: "Hide detail", es: "Ocultar detalle" })
                        : busyKey === `detail:${item.id}`
                          ? localized(locale, { en: "Loading...", es: "Cargando..." })
                          : localized(locale, { en: "Inspect detail", es: "Ver detalle" })}
                    </button>
                    <button
                      type="button"
                      className="button button--solid"
                      onClick={() =>
                        void runAction(
                          `/moderation/evidence/${item.id}/approve`,
                          item.id,
                          localized(locale, {
                            en: "Evidence proposal approved.",
                            es: "Propuesta de evidencia aprobada.",
                          }),
                        )
                      }
                      disabled={busyKey === item.id}
                    >
                      {localized(locale, { en: "Approve", es: "Aprobar" })}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() =>
                        void runAction(
                          `/moderation/evidence/${item.id}/request-correction`,
                          item.id,
                          localized(locale, {
                            en: "Correction requested.",
                            es: "Correccion solicitada.",
                          }),
                        )
                      }
                      disabled={busyKey === item.id}
                    >
                      {localized(locale, { en: "Request correction", es: "Pedir corrección" })}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() =>
                        void runAction(
                          `/moderation/evidence/${item.id}/reject`,
                          item.id,
                          localized(locale, {
                            en: "Evidence proposal rejected.",
                            es: "Propuesta de evidencia rechazada.",
                          }),
                        )
                      }
                      disabled={busyKey === item.id}
                    >
                      {localized(locale, { en: "Reject", es: "Rechazar" })}
                    </button>
                  </div>
                  {expandedId === item.id && detailCache[item.id] ? (
                    <div className="backoffice-inline-detail">
                      {(() => {
                        const detail = detailCache[item.id] as ModerationEvidenceProposalDetail;

                        return (
                          <>
                            <div className="grid-two backoffice-grid">
                              <article className="queue-report-card">
                                <strong>EN</strong>
                                <span>{detail.translations.en.title ?? "-"}</span>
                                <span className="eyebrow">
                                  {localized(locale, {
                                    en: "Summary",
                                    es: "Resumen",
                                  })}
                                </span>
                                <p>{detail.translations.en.summary ?? "-"}</p>
                                <span className="eyebrow">
                                  {localized(locale, {
                                    en: "Context",
                                    es: "Contexto",
                                  })}
                                </span>
                                <p>{detail.translations.en.context ?? "-"}</p>
                              </article>
                              <article className="queue-report-card">
                                <strong>ES</strong>
                                <span>{detail.translations.es.title ?? "-"}</span>
                                <span className="eyebrow">
                                  {localized(locale, {
                                    en: "Summary",
                                    es: "Resumen",
                                  })}
                                </span>
                                <p>{detail.translations.es.summary ?? "-"}</p>
                                <span className="eyebrow">
                                  {localized(locale, {
                                    en: "Context",
                                    es: "Contexto",
                                  })}
                                </span>
                                <p>{detail.translations.es.context ?? "-"}</p>
                              </article>
                            </div>
                            <div className="detail-tags">
                              {detail.activities.map((value) => (
                                <span key={`${item.id}-activity-name-${value.id}`} className="tag-chip">
                                  {value.title}
                                </span>
                              ))}
                            </div>
                            {detail.sourceUrl ? (
                              <a
                                href={detail.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="button button--ghost"
                              >
                                {localized(locale, { en: "Open source", es: "Abrir fuente" })}
                              </a>
                            ) : null}
                          </>
                        );
                      })()}
                    </div>
                  ) : null}
                </article>
              ))
            : null}

          {queue.type === "comments"
            ? (queue.items as ModerationQueueCommentItem[]).map((item) => {
                const activityTarget = item.target.activity;
                const evidenceTarget = item.target.evidence;
                const targetHref = getCommentTargetHref(item, locale);

                return (
                  <article key={item.id} className="backoffice-card">
                    <div className="backoffice-card__header">
                      <div>
                        <h2>{item.author.displayName}</h2>
                        <p>{item.author.email}</p>
                      </div>
                      <div className="profile-chips">
                        <span className="status-pill">
                          {formatEditorialStatus(item.reportStatus, locale)}
                        </span>
                        <span className="tag-chip tag-chip--muted">
                          {formatEditorialStatus(item.visibilityStatus, locale)}
                        </span>
                      </div>
                    </div>
                    <div className="queue-target-card">
                      {targetHref ? (
                        <Link href={targetHref} className="queue-target-card__link">
                          <strong>{formatCommentTarget(item, locale)}</strong>
                        </Link>
                      ) : (
                        <strong>{formatCommentTarget(item, locale)}</strong>
                      )}
                      {activityTarget ? (
                        <div className="queue-target-card__meta">
                          <span className="tag-chip">{activityTarget.key}</span>
                          {activityTarget.slug ? (
                            <span className="tag-chip tag-chip--muted">
                              /activities/{activityTarget.slug}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      {evidenceTarget ? (
                        <>
                          <div className="queue-target-card__meta">
                            <span className="tag-chip">{evidenceTarget.type}</span>
                            {evidenceTarget.slug ? (
                              <span className="tag-chip tag-chip--muted">
                                /evidence/{evidenceTarget.slug}
                              </span>
                            ) : null}
                          </div>
                          {evidenceTarget.activityKeys.length > 0 ? (
                            <div className="detail-tags">
                              {evidenceTarget.activityKeys.map((value, index) => (
                                <span
                                  key={`${item.id}-evidence-activity-${value}`}
                                  className="tag-chip tag-chip--muted"
                                >
                                  {evidenceTarget.activityTitles[index] ?? value}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </>
                      ) : null}
                      {targetHref ? (
                        <Link href={targetHref} className="queue-target-card__action">
                          {localized(locale, {
                            en: "Open public detail",
                            es: "Abrir detalle público",
                          })}
                        </Link>
                      ) : null}
                    </div>
                    <p>{item.text}</p>
                    <ul className="muted-list">
                      {item.target.activityId ? (
                        <li>
                          {localized(locale, { en: "Activity id", es: "Id de actividad" })}:{" "}
                          {item.target.activityId}
                        </li>
                      ) : null}
                      {item.target.evidenceId ? (
                        <li>
                          {localized(locale, { en: "Evidence id", es: "Id de evidencia" })}:{" "}
                          {item.target.evidenceId}
                        </li>
                      ) : null}
                      {item.target.parentCommentId ? (
                        <li>
                          {localized(locale, { en: "Reply to", es: "Respuesta a" })}:{" "}
                          {item.target.parentCommentId}
                        </li>
                      ) : null}
                      <li>
                        {localized(locale, { en: "Reported at", es: "Denunciado el" })}:{" "}
                        {formatDate(item.createdAt, locale)}
                      </li>
                    </ul>
                    <div className="queue-report-list">
                      {item.reports.map((report) => (
                        <div key={report.id} className="queue-report-card">
                          <strong>{report.reason}</strong>
                          <span>
                            {report.reporter.displayName} / {formatDate(report.createdAt, locale)}
                          </span>
                          {report.details ? <p>{report.details}</p> : null}
                        </div>
                      ))}
                    </div>
                    <label className="comment-form">
                      <span>{localized(locale, { en: "Moderator note", es: "Nota del moderador" })}</span>
                      <textarea
                        value={reasons[item.id] ?? ""}
                        onChange={(event) =>
                          setReasons((current) => ({ ...current, [item.id]: event.target.value }))
                        }
                        rows={3}
                      />
                    </label>
                    <div className="action-row">
                      <button
                        type="button"
                        className="button button--solid"
                        onClick={() =>
                          void runAction(
                            `/moderation/comments/${item.id}/hide`,
                            item.id,
                            localized(locale, {
                              en: "Comment hidden.",
                              es: "Comentario ocultado.",
                            }),
                          )
                        }
                        disabled={busyKey === item.id}
                      >
                        {localized(locale, { en: "Hide comment", es: "Ocultar comentario" })}
                      </button>
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={() =>
                          void runAction(
                            `/moderation/comments/${item.id}/resolve-report`,
                            item.id,
                            localized(locale, {
                              en: "Report resolved.",
                              es: "Denuncia resuelta.",
                            }),
                          )
                        }
                        disabled={busyKey === item.id}
                      >
                        {localized(locale, { en: "Resolve report", es: "Resolver denuncia" })}
                      </button>
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={() =>
                          void runAction(
                            `/moderation/comments/${item.id}/archive`,
                            item.id,
                            localized(locale, {
                              en: "Comment archived.",
                              es: "Comentario archivado.",
                            }),
                          )
                        }
                        disabled={busyKey === item.id}
                      >
                        {localized(locale, { en: "Archive", es: "Archivar" })}
                      </button>
                    </div>
                  </article>
                );
              })
            : null}

          {queue.type === "activities"
            ? (queue.items as ModerationQueueActivityItem[]).map((item) => (
                <article key={item.id} className="backoffice-card">
                  <div className="backoffice-card__header">
                    <div>
                      <h2>{item.title}</h2>
                      <p>
                        {item.key} / {formatDate(item.updatedAt, locale)}
                      </p>
                    </div>
                    <div className="profile-chips">
                      <span className="status-pill">
                        {formatEditorialStatus(item.status, locale)}
                      </span>
                      <span className="tag-chip">{formatAiStatus(item.officialAiStatus, locale)}</span>
                      <span className="tag-chip tag-chip--muted">
                        {item.hasEditorialSummary
                          ? localized(locale, { en: "summary ready", es: "resumen listo" })
                          : localized(locale, { en: "summary missing", es: "falta resumen" })}
                      </span>
                    </div>
                  </div>
                  <p>
                    {localized(locale, {
                      en: "This activity is waiting for editorial review before publication.",
                      es: "Esta actividad espera revisión editorial antes de publicarse.",
                    })}
                  </p>
                  <ul className="muted-list">
                    <li>
                      {localized(locale, { en: "Evidence linked", es: "Evidencias vinculadas" })}:{" "}
                      {item.evidenceCount ?? 0}
                    </li>
                  </ul>
                  <div className="action-row">
                    <Link
                      href={buildPath(`${editorialPath}/${item.id}`, locale, { page: "1" })}
                      className="button button--solid"
                    >
                      {localized(locale, {
                        en: "Open editorial workspace",
                        es: "Abrir workspace editorial",
                      })}
                    </Link>
                  </div>
                </article>
              ))
            : null}
        </div>
      ) : (
        <div className="empty-panel">
          <p>
            {localized(locale, {
              en: "Nothing is waiting in this queue right now.",
              es: "No hay elementos pendientes en esta cola ahora mismo.",
            })}
          </p>
        </div>
      )}

      {queue.total > queue.pageSize ? (
        <div className="pagination-row">
          <Link
            href={filterHref(currentStatus, queue.page > 1 ? String(queue.page - 1) : "1")}
            className={queue.page > 1 ? "button button--ghost" : "button button--ghost is-disabled"}
            aria-disabled={queue.page <= 1}
          >
            {localized(locale, { en: "Previous", es: "Anterior" })}
          </Link>
          <span className="pagination-copy">
            {localized(locale, {
              en: `Page ${queue.page} of ${totalPages}`,
              es: `Página ${queue.page} de ${totalPages}`,
            })}
          </span>
          <Link
            href={filterHref(
              currentStatus,
              queue.page < totalPages ? String(queue.page + 1) : String(totalPages),
            )}
            className={
              queue.page < totalPages ? "button button--ghost" : "button button--ghost is-disabled"
            }
            aria-disabled={queue.page >= totalPages}
          >
            {localized(locale, { en: "Next", es: "Siguiente" })}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
