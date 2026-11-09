"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { type EditorialActivityDetail } from "@/lib/api";
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

type EditorialActivityWorkspaceProps = {
  locale: Locale;
  activity: EditorialActivityDetail;
  listQuery: Record<string, string | undefined>;
};

const EDITORIAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "needs_correction",
] as const;

const RELIABILITY_FLAGS = ["verified", "uncertain", "flagged"] as const;

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function EditorialActivityWorkspace({
  locale,
  activity,
  listQuery,
}: EditorialActivityWorkspaceProps) {
  const router = useRouter();
  const [sourceTitleEn, setSourceTitleEn] = useState(activity.translations.en.title ?? "");
  const [sourceTitleEs, setSourceTitleEs] = useState(activity.translations.es.title ?? "");
  const [sourceShortEn, setSourceShortEn] = useState(
    activity.translations.en.shortDescription ?? "",
  );
  const [sourceShortEs, setSourceShortEs] = useState(
    activity.translations.es.shortDescription ?? "",
  );
  const [sourceFullEn, setSourceFullEn] = useState(
    activity.translations.en.fullDescription ?? "",
  );
  const [sourceFullEs, setSourceFullEs] = useState(
    activity.translations.es.fullDescription ?? "",
  );
  const [sourceSlugEn, setSourceSlugEn] = useState(activity.translations.en.slug ?? "");
  const [sourceSlugEs, setSourceSlugEs] = useState(activity.translations.es.slug ?? "");
  const [summaryEn, setSummaryEn] = useState(activity.translations.en.editorialSummary ?? "");
  const [summaryEs, setSummaryEs] = useState(activity.translations.es.editorialSummary ?? "");
  const [statusValue, setStatusValue] = useState(String(activity.officialAiStatus ?? 0));
  const [editorialStatus, setEditorialStatus] = useState(activity.editorialStatus);
  const [rationale, setRationale] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [evidenceReasons, setEvidenceReasons] = useState<Record<string, string>>({});
  const latestHistoryEntry = activity.editorialHistory[0] ?? null;
  const readyForApproval =
    activity.completionSignals.hasEditorialSummaryEn &&
    activity.completionSignals.hasEditorialSummaryEs &&
    activity.completionSignals.hasEvidence &&
    typeof activity.officialAiStatus === "number";
  const laneListHref = buildPath("/backoffice/editorial", locale, {
    ...listQuery,
    status: activity.reviewNavigation.laneStatus,
  });
  const nextLaneHref = activity.reviewNavigation.nextId
    ? buildPath(
        `/backoffice/editorial/activities/${activity.reviewNavigation.nextId}`,
        locale,
        {
          ...listQuery,
          status: activity.reviewNavigation.laneStatus,
        },
      )
    : laneListHref;
  const targetLaneHref = buildPath("/backoffice/editorial", locale, {
    status: editorialStatus,
    page: "1",
  });
  const readyCandidatesHref = buildPath("/backoffice/editorial", locale, {
    status: "pending",
    hasEditorialSummary: "true",
    hasEvidence: "true",
    page: "1",
  });
  const missingSummariesHref = buildPath("/backoffice/editorial", locale, {
    status: "pending",
    hasEditorialSummary: "false",
    page: "1",
  });
  const missingEvidenceHref = buildPath("/backoffice/editorial", locale, {
    status: "pending",
    hasEvidence: "false",
    page: "1",
  });
  const approvedLaneHref = buildPath("/backoffice/editorial", locale, {
    status: "approved",
    page: "1",
  });
  const followThroughMessage =
    editorialStatus === "approved"
      ? readyForApproval
        ? localized(locale, {
            en: "This decision will move the activity into the approved lane so you can review its public-facing state next.",
            es: "Esta decisión moverá la actividad a la cola de aprobadas para que puedas revisar su estado público después.",
          })
        : localized(locale, {
            en: "Approval is selected, but the readiness board still shows blockers you should clear first.",
            es: "La aprobación está seleccionada, pero el panel de readiness todavía muestra bloqueos que conviene despejar antes.",
          })
      : editorialStatus === "needs_correction"
        ? localized(locale, {
            en: "This sends the activity back for editorial fixes while keeping it out of the public catalog.",
            es: "Esto devuelve la actividad a trabajo editorial pendiente sin dejarla entrar al catálogo público.",
          })
        : editorialStatus === "rejected"
          ? localized(locale, {
              en: "This removes the activity from the active publication lane and keeps a trace in editorial history.",
              es: "Esto saca la actividad de la cola activa de publicación y deja trazabilidad en el historial editorial.",
            })
          : localized(locale, {
              en: "Keep the activity in pending if you still need more evidence, summaries or editorial context.",
              es: "Mantén la actividad en pendiente si todavía necesita más evidencia, resúmenes o contexto editorial.",
            });

  async function saveSourceContent() {
    setBusyKey("source");
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/editorial/activities/${activity.id}/source`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            translations: {
              en: {
                title: sourceTitleEn,
                shortDescription: sourceShortEn,
                fullDescription: sourceFullEn,
                slug: sourceSlugEn,
              },
              es: {
                title: sourceTitleEs,
                shortDescription: sourceShortEs,
                fullDescription: sourceFullEs,
                slug: sourceSlugEs,
              },
            },
          }),
        },
      );

      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          resolveApiErrorPayloadMessage(
            body ?? null,
            locale,
            localized(locale, {
              en: "Could not save the activity information.",
              es: "No se pudo guardar la informacion de la actividad.",
            }),
          ),
        );
      }

      setFeedback(
        localized(locale, {
          en: "Activity information updated.",
          es: "Informacion de la actividad actualizada.",
        }),
      );
      router.refresh();
    } catch (sourceError) {
      setError(
        sourceError instanceof Error
          ? sourceError.message
          : localized(locale, {
              en: "Unexpected activity information error.",
              es: "Error inesperado al guardar la informacion de la actividad.",
            }),
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function saveSummary(mode: "stay" | "lane" = "stay") {
    setBusyKey(mode === "lane" ? "summary:lane" : "summary");
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/editorial/activities/${activity.id}/summary`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            translations: {
              en: { editorialSummary: summaryEn },
              es: { editorialSummary: summaryEs },
            },
          }),
        },
      );

      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          resolveApiErrorPayloadMessage(
            body ?? null,
            locale,
            localized(locale, {
              en: "Could not save the editorial summary.",
              es: "No se pudo guardar el resumen editorial.",
            }),
          ),
        );
      }

      setFeedback(
        localized(locale, {
          en: "Editorial summary updated.",
          es: "Resumen editorial actualizado.",
        }),
      );
      if (mode === "lane") {
        router.push(laneListHref);
        return;
      }

      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : localized(locale, {
              en: "Unexpected summary error.",
              es: "Error inesperado al guardar resumen.",
            }),
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function saveStatus(mode: "stay" | "next" | "lane" = "stay") {
    if (!rationale.trim()) {
      setError(
        localized(locale, {
          en: "Write a rationale before updating editorial status.",
          es: "Escribe un fundamento antes de actualizar el estado editorial.",
        }),
      );
      return;
    }

    setBusyKey(
      mode === "next" ? "status:next" : mode === "lane" ? "status:lane" : "status",
    );
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/editorial/activities/${activity.id}/status`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            officialAiStatus: Number(statusValue),
            editorialStatus,
            rationale,
          }),
        },
      );

      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          resolveApiErrorPayloadMessage(
            body ?? null,
            locale,
            localized(locale, {
              en: "Could not update the editorial decision.",
              es: "No se pudo actualizar la decision editorial.",
            }),
          ),
        );
      }

      setFeedback(
        localized(locale, {
          en: "Editorial status updated.",
          es: "Estado editorial actualizado.",
        }),
      );
      setRationale("");
      if (mode === "next") {
        router.push(nextLaneHref);
        return;
      }
      if (mode === "lane") {
        router.push(targetLaneHref);
        return;
      }

      router.refresh();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : localized(locale, {
              en: "Unexpected editorial status error.",
              es: "Error inesperado al actualizar estado editorial.",
            }),
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function markEvidenceReliability(evidenceId: string, flag: string) {
    const reason = evidenceReasons[evidenceId]?.trim();
    if (!reason) {
      setError(
        localized(locale, {
          en: "Write a rationale before flagging evidence reliability.",
          es: "Escribe un fundamento antes de marcar confiabilidad de evidencia.",
        }),
      );
      return;
    }

    setBusyKey(`evidence:${evidenceId}:${flag}`);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/editorial/evidence/${evidenceId}/mark-reliability`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flag, reason }),
        },
      );

      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          resolveApiErrorPayloadMessage(
            body ?? null,
            locale,
            localized(locale, {
              en: "Could not update evidence reliability.",
              es: "No se pudo actualizar la confiabilidad de la evidencia.",
            }),
          ),
        );
      }

      setFeedback(
        localized(locale, {
          en: "Evidence reliability updated.",
          es: "Confiabilidad de evidencia actualizada.",
        }),
      );
      router.refresh();
    } catch (evidenceError) {
      setError(
        evidenceError instanceof Error
          ? evidenceError.message
          : localized(locale, {
              en: "Unexpected evidence reliability error.",
              es: "Error inesperado al actualizar confiabilidad de evidencia.",
            }),
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="page-stack">
      <section className="glass-panel page-stack">
        <div className="backoffice-card__header">
          <div>
            <span className="eyebrow">
              {localized(locale, { en: "Editorial workspace", es: "Workspace editorial" })}
            </span>
            <h1 className="section-title">{activity.title}</h1>
            <p className="section-copy">
              {activity.key} / {formatGranularity(activity.granularity, locale)} / {activity.slug}
            </p>
          </div>
          <div className="profile-chips">
            <span className="status-pill">
              {formatEditorialStatus(activity.editorialStatus, locale)}
            </span>
            <span className="tag-chip">{formatAiStatus(activity.officialAiStatus, locale)}</span>
          </div>
        </div>

        <div className="detail-tags">
          {activity.industries.map((item) => (
            <span key={item.key} className="tag-chip">
              {item.name}
            </span>
          ))}
          {activity.categories.map((item) => (
            <span key={item.key} className="tag-chip tag-chip--muted">
              {item.name}
            </span>
          ))}
        </div>

        <div className="detail-tags">
          <span className="tag-chip tag-chip--muted">
            {activity.completionSignals.hasEditorialSummaryEn
              ? localized(locale, { en: "EN summary ready", es: "Resumen EN listo" })
              : localized(locale, { en: "EN summary missing", es: "Falta resumen EN" })}
          </span>
          <span className="tag-chip tag-chip--muted">
            {activity.completionSignals.hasEditorialSummaryEs
              ? localized(locale, { en: "ES summary ready", es: "Resumen ES listo" })
              : localized(locale, { en: "ES summary missing", es: "Falta resumen ES" })}
          </span>
          <span className="tag-chip tag-chip--muted">
            {activity.completionSignals.hasEvidence
              ? localized(locale, { en: "Evidence linked", es: "Con evidencia" })
              : localized(locale, { en: "No evidence yet", es: "Sin evidencia aun" })}
          </span>
        </div>

        <div className="action-row">
          <Link
            href={buildPath("/backoffice/editorial", locale, listQuery)}
            className="button button--ghost"
          >
            {localized(locale, { en: "Back to list", es: "Volver a la lista" })}
          </Link>
          {activity.reviewNavigation.previousId ? (
            <Link
              href={buildPath(
                `/backoffice/editorial/activities/${activity.reviewNavigation.previousId}`,
                locale,
                {
                  ...listQuery,
                  status: activity.reviewNavigation.laneStatus,
                },
              )}
              className="button button--ghost"
            >
              {localized(locale, { en: "Previous in lane", es: "Anterior en cola" })}
            </Link>
          ) : null}
          {activity.reviewNavigation.nextId ? (
            <Link
              href={buildPath(
                `/backoffice/editorial/activities/${activity.reviewNavigation.nextId}`,
                locale,
                {
                  ...listQuery,
                  status: activity.reviewNavigation.laneStatus,
                },
              )}
              className="button button--solid"
            >
              {localized(locale, { en: "Next in lane", es: "Siguiente en cola" })}
            </Link>
          ) : null}
        </div>

        {activity.editorialStatus === "approved" ? (
          <div className="action-row">
            {activity.translations.en.slug ? (
              <Link
                href={buildPath(`/activities/${activity.translations.en.slug}`, "en")}
                className="button button--ghost"
              >
                {localized(locale, { en: "Open public EN", es: "Abrir pública EN" })}
              </Link>
            ) : null}
            {activity.translations.es.slug ? (
              <Link
                href={buildPath(`/activities/${activity.translations.es.slug}`, "es")}
                className="button button--ghost"
              >
                {localized(locale, { en: "Open public ES", es: "Abrir pública ES" })}
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>

      {feedback ? <p className="form-feedback form-feedback--success">{feedback}</p> : null}
      {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Editing guide", es: "Guia de edicion" })}
          </span>
          <h2>
            {localized(locale, {
              en: "Edit activity information and publication text separately",
              es: "Edita por separado la informacion de la actividad y el texto de publicacion",
            })}
          </h2>
          <p className="section-copy">
            {localized(locale, {
              en: "Use the activity information block to edit title, descriptions, and slug. Use the publication summaries block to control the shorter public-facing framing.",
              es: "Usa el bloque de informacion de la actividad para editar titulo, descripciones y slug. Usa el bloque de resumenes de publicacion para controlar el resumen publico mas corto.",
            })}
          </p>
        </div>
        <div className="action-row">
          <a href="#source-content-editor" className="button button--solid">
            {localized(locale, {
              en: "Jump to activity information",
              es: "Ir a la informacion de la actividad",
            })}
          </a>
          <a href="#editorial-summary-editor" className="button button--ghost">
            {localized(locale, {
              en: "Jump to editable summaries",
              es: "Ir a los resumenes editables",
            })}
          </a>
        </div>
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Readiness board", es: "Panel de readiness" })}
          </span>
          <h2>
            {localized(locale, {
              en: "What is still blocking publication",
              es: "Qué sigue bloqueando la publicación",
            })}
          </h2>
          <p className="section-copy">
            {readyForApproval
              ? localized(locale, {
                  en: "This activity is structurally ready for approval. You can focus on the final editorial decision.",
                  es: "Esta actividad ya esta estructuralmente lista para aprobar. Puedes enfocarte en la decision editorial final.",
                })
              : localized(locale, {
                  en: "Use these signals to clear the remaining blockers before approving this activity.",
                  es: "Usa estas señales para despejar los bloqueos pendientes antes de aprobar esta actividad.",
                })}
          </p>
        </div>

        <div className="backoffice-metric-grid">
          <article
            className={
              activity.completionSignals.hasEditorialSummaryEn
                ? "metric-card metric-card--positive"
                : "metric-card"
            }
          >
            <strong>EN</strong>
            <span>
              {activity.completionSignals.hasEditorialSummaryEn
                ? localized(locale, { en: "summary ready", es: "resumen listo" })
                : localized(locale, { en: "summary missing", es: "falta resumen" })}
            </span>
          </article>
          <article
            className={
              activity.completionSignals.hasEditorialSummaryEs
                ? "metric-card metric-card--positive"
                : "metric-card"
            }
          >
            <strong>ES</strong>
            <span>
              {activity.completionSignals.hasEditorialSummaryEs
                ? localized(locale, { en: "summary ready", es: "resumen listo" })
                : localized(locale, { en: "summary missing", es: "falta resumen" })}
            </span>
          </article>
          <article
            className={
              activity.completionSignals.hasEvidence
                ? "metric-card metric-card--positive"
                : "metric-card"
            }
          >
            <strong>{activity.evidences.length}</strong>
            <span>
              {activity.completionSignals.hasEvidence
                ? localized(locale, { en: "linked evidence", es: "evidencias vinculadas" })
                : localized(locale, { en: "no evidence yet", es: "sin evidencia aun" })}
            </span>
          </article>
          <article className={readyForApproval ? "metric-card metric-card--positive" : "metric-card"}>
            <strong>{formatAiStatus(activity.officialAiStatus, locale)}</strong>
            <span>
              {readyForApproval
                ? localized(locale, { en: "approval-ready status", es: "estado listo para aprobar" })
                : localized(locale, { en: "review status value", es: "valor de estado a revisar" })}
            </span>
          </article>
        </div>

        <div className="detail-tags">
          <span className={readyForApproval ? "tag-chip" : "tag-chip tag-chip--muted"}>
            {readyForApproval
              ? localized(locale, { en: "Ready for approval", es: "Lista para aprobar" })
              : localized(locale, { en: "Still blocked", es: "Todavía bloqueada" })}
          </span>
          <span className="tag-chip tag-chip--muted">
            {localized(locale, {
              en: `${activity.reviewNavigation.totalInLane} items in this lane`,
              es: `${activity.reviewNavigation.totalInLane} elementos en esta cola`,
            })}
          </span>
          <span className="tag-chip tag-chip--muted">
            {localized(locale, {
              en: `${activity.editorialHistory.length} logged decisions`,
              es: `${activity.editorialHistory.length} decisiones registradas`,
            })}
          </span>
        </div>

        <div className="action-row">
          <Link href={laneListHref} className="button button--ghost">
            {localized(locale, { en: "Return to lane", es: "Volver a la cola" })}
          </Link>
          <Link href={nextLaneHref} className="button button--solid">
            {activity.reviewNavigation.nextId
              ? localized(locale, { en: "Open next candidate", es: "Abrir siguiente candidata" })
              : localized(locale, { en: "Finish this lane", es: "Terminar esta cola" })}
          </Link>
        </div>

        {latestHistoryEntry ? (
          <article className="queue-report-card">
            <strong>
              {localized(locale, { en: "Latest editorial move", es: "Último movimiento editorial" })}
            </strong>
            <span>
              {latestHistoryEntry.actor.displayName} / {formatDate(latestHistoryEntry.createdAt, locale)}
            </span>
            <p>{latestHistoryEntry.rationale}</p>
          </article>
        ) : null}
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Follow-through", es: "Siguiente paso" })}
          </span>
          <h2>
            {localized(locale, {
              en: "Move faster after each editorial decision",
              es: "Moverse más rápido después de cada decisión editorial",
            })}
          </h2>
          <p className="section-copy">{followThroughMessage}</p>
        </div>

        <div className="detail-tags">
          <Link href={readyCandidatesHref} className="tag-chip">
            {localized(locale, { en: "Open ready candidates", es: "Abrir candidatas listas" })}
          </Link>
          <Link href={missingSummariesHref} className="tag-chip tag-chip--muted">
            {localized(locale, { en: "Open missing summaries", es: "Abrir faltantes de resumen" })}
          </Link>
          <Link href={missingEvidenceHref} className="tag-chip tag-chip--muted">
            {localized(locale, { en: "Open missing evidence", es: "Abrir faltantes de evidencia" })}
          </Link>
          <Link href={approvedLaneHref} className="tag-chip tag-chip--muted">
            {localized(locale, { en: "Open approved lane", es: "Abrir cola de aprobadas" })}
          </Link>
        </div>

        <div className="action-row">
          <Link href={laneListHref} className="button button--ghost">
            {localized(locale, { en: "Back to current lane", es: "Volver a la cola actual" })}
          </Link>
          <Link href={targetLaneHref} className="button button--ghost">
            {localized(locale, { en: "Open selected target lane", es: "Abrir cola objetivo seleccionada" })}
          </Link>
          <Link href={nextLaneHref} className="button button--solid">
            {activity.reviewNavigation.nextId
              ? localized(locale, { en: "Continue with next candidate", es: "Seguir con la siguiente candidata" })
              : localized(locale, { en: "Finish current lane", es: "Terminar la cola actual" })}
          </Link>
        </div>
      </section>

      <section className="glass-panel page-stack" id="source-content-editor">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Activity information", es: "Informacion de la actividad" })}
          </span>
          <h2>
            {localized(locale, {
              en: "Editable bilingual source content",
              es: "Contenido base bilingue editable",
            })}
          </h2>
          <p className="section-copy">
            {localized(locale, {
              en: "Edit the base information of the activity here. This affects the activity detail and the richer descriptive content used across the catalog.",
              es: "Edita aqui la informacion base de la actividad. Esto impacta el detalle de actividad y el contenido descriptivo mas rico usado en el catalogo.",
            })}
          </p>
        </div>

        <div className="grid-two backoffice-grid">
          <div className="page-stack">
            <label className="comment-form">
              <span>EN {localized(locale, { en: "title", es: "titulo" })}</span>
              <input value={sourceTitleEn} onChange={(event) => setSourceTitleEn(event.target.value)} />
            </label>
            <label className="comment-form">
              <span>EN {localized(locale, { en: "short description", es: "descripcion corta" })}</span>
              <textarea value={sourceShortEn} onChange={(event) => setSourceShortEn(event.target.value)} rows={4} />
            </label>
            <label className="comment-form">
              <span>EN {localized(locale, { en: "full description", es: "descripcion completa" })}</span>
              <textarea value={sourceFullEn} onChange={(event) => setSourceFullEn(event.target.value)} rows={8} />
            </label>
            <label className="comment-form">
              <span>EN slug</span>
              <input value={sourceSlugEn} onChange={(event) => setSourceSlugEn(event.target.value)} />
            </label>
          </div>
          <div className="page-stack">
            <label className="comment-form">
              <span>ES {localized(locale, { en: "title", es: "titulo" })}</span>
              <input value={sourceTitleEs} onChange={(event) => setSourceTitleEs(event.target.value)} />
            </label>
            <label className="comment-form">
              <span>ES {localized(locale, { en: "short description", es: "descripcion corta" })}</span>
              <textarea value={sourceShortEs} onChange={(event) => setSourceShortEs(event.target.value)} rows={4} />
            </label>
            <label className="comment-form">
              <span>ES {localized(locale, { en: "full description", es: "descripcion completa" })}</span>
              <textarea value={sourceFullEs} onChange={(event) => setSourceFullEs(event.target.value)} rows={8} />
            </label>
            <label className="comment-form">
              <span>ES slug</span>
              <input value={sourceSlugEs} onChange={(event) => setSourceSlugEs(event.target.value)} />
            </label>
          </div>
        </div>

        <div className="action-row">
          <button
            type="button"
            className="button button--solid"
            onClick={() => void saveSourceContent()}
            disabled={busyKey === "source"}
          >
            {busyKey === "source"
              ? localized(locale, { en: "Saving...", es: "Guardando..." })
              : localized(locale, { en: "Save activity information", es: "Guardar informacion de la actividad" })}
          </button>
          <a href="#editorial-summary-editor" className="button button--ghost">
            {localized(locale, {
              en: "Continue to publication summaries",
              es: "Seguir a resumenes de publicacion",
            })}
          </a>
        </div>

        <article className="queue-report-card">
          <strong>
            {localized(locale, { en: "Reference snapshot", es: "Snapshot de referencia" })}
          </strong>
          <p>
            {localized(locale, {
              en: "Below you still see the currently stored source content as a quick visual reference while editing.",
              es: "Debajo sigues viendo el contenido base actualmente guardado como referencia visual rapida mientras editas.",
            })}
          </p>
        </article>

        <div className="grid-two backoffice-grid">
          <article className="backoffice-card">
            <h3>EN</h3>
            <ul className="muted-list">
              <li>
                {localized(locale, { en: "Title", es: "Título" })}: {activity.translations.en.title}
              </li>
              <li>
                {localized(locale, { en: "Short description", es: "Descripción corta" })}:{" "}
                {activity.translations.en.shortDescription ?? "-"}
              </li>
              <li>
                {localized(locale, { en: "Slug", es: "Slug" })}: {activity.translations.en.slug ?? "-"}
              </li>
            </ul>
            <p>{activity.translations.en.fullDescription ?? "-"}</p>
          </article>
          <article className="backoffice-card">
            <h3>ES</h3>
            <ul className="muted-list">
              <li>
                {localized(locale, { en: "Title", es: "Título" })}: {activity.translations.es.title}
              </li>
              <li>
                {localized(locale, { en: "Short description", es: "Descripción corta" })}:{" "}
                {activity.translations.es.shortDescription ?? "-"}
              </li>
              <li>
                {localized(locale, { en: "Slug", es: "Slug" })}: {activity.translations.es.slug ?? "-"}
              </li>
            </ul>
            <p>{activity.translations.es.fullDescription ?? "-"}</p>
          </article>
        </div>
      </section>

      <section className="glass-panel page-stack" id="editorial-summary-editor">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Editable fields", es: "Campos editables" })}
          </span>
          <h2>
            {localized(locale, {
              en: "Bilingual publication summaries",
              es: "Resúmenes bilingües de publicación",
            })}
          </h2>
          <p className="section-copy">
            {localized(locale, {
              en: "Edit these two summaries to control the public text shown in the catalog and activity detail.",
              es: "Edita estos dos resúmenes para controlar el texto público que se muestra en el catálogo y en el detalle de actividad.",
            })}
          </p>
        </div>

        <div className="grid-two backoffice-grid">
          <label className="comment-form">
            <span>EN</span>
            <textarea
              value={summaryEn}
              onChange={(event) => setSummaryEn(event.target.value)}
              rows={8}
            />
          </label>
          <label className="comment-form">
            <span>ES</span>
            <textarea
              value={summaryEs}
              onChange={(event) => setSummaryEs(event.target.value)}
              rows={8}
            />
          </label>
        </div>

        <div className="action-row">
          <button
            type="button"
            className="button button--solid"
            onClick={() => void saveSummary()}
            disabled={busyKey === "summary" || busyKey === "summary:lane"}
          >
            {busyKey === "summary"
              ? localized(locale, { en: "Saving...", es: "Guardando..." })
              : localized(locale, { en: "Save edited summaries", es: "Guardar resúmenes editados" })}
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => void saveSummary("lane")}
            disabled={busyKey === "summary" || busyKey === "summary:lane"}
          >
            {busyKey === "summary:lane"
              ? localized(locale, { en: "Saving...", es: "Guardando..." })
              : localized(locale, {
                  en: "Save summaries and return to lane",
                  es: "Guardar resúmenes y volver a la cola",
                })}
          </button>
        </div>
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Decision", es: "Decisión" })}
          </span>
          <h2>
              {localized(locale, {
                en: "Official status and publication state",
                es: "Estado oficial y estado de publicación",
              })}
            </h2>
            <p className="section-copy">
              {localized(locale, {
                en: `Lane ${formatEditorialStatus(activity.reviewNavigation.laneStatus, locale)} with ${activity.reviewNavigation.totalInLane} activities.`,
                es: `Cola ${formatEditorialStatus(activity.reviewNavigation.laneStatus, locale)} con ${activity.reviewNavigation.totalInLane} actividades.`,
              })}
            </p>
          </div>

        <div className="grid-two backoffice-grid">
          <label className="comment-form">
            <span>{localized(locale, { en: "Official AI status", es: "Estado IA oficial" })}</span>
            <select
              value={statusValue}
              onChange={(event) => setStatusValue(event.target.value)}
            >
              {["0", "1", "2", "3", "4", "5"].map((value) => (
                <option key={value} value={value}>
                  {formatAiStatus(Number(value), locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="comment-form">
            <span>{localized(locale, { en: "Editorial status", es: "Estado editorial" })}</span>
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

        <label className="comment-form">
          <span>{localized(locale, { en: "Rationale", es: "Fundamento" })}</span>
          <textarea
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
            rows={4}
          />
        </label>

        <article className="queue-report-card">
          <strong>
            {localized(locale, { en: "What happens next", es: "Qué pasa después" })}
          </strong>
          <p>{followThroughMessage}</p>
        </article>

        <div className="action-row">
          <button
            type="button"
            className="button button--solid"
            onClick={() => void saveStatus()}
            disabled={
              busyKey === "status" ||
              busyKey === "status:next" ||
              busyKey === "status:lane"
            }
          >
            {busyKey === "status"
              ? localized(locale, { en: "Updating...", es: "Actualizando..." })
              : localized(locale, {
                  en: "Commit editorial decision",
                  es: "Confirmar decision editorial",
                })}
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => void saveStatus("next")}
            disabled={
              busyKey === "status" ||
              busyKey === "status:next" ||
              busyKey === "status:lane"
            }
          >
            {busyKey === "status:next"
              ? localized(locale, { en: "Updating...", es: "Actualizando..." })
              : activity.reviewNavigation.nextId
                ? localized(locale, {
                    en: "Commit and open next in lane",
                    es: "Confirmar y abrir la siguiente en cola",
                  })
                : localized(locale, {
                    en: "Commit and finish lane",
                    es: "Confirmar y terminar la cola",
                  })}
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => void saveStatus("lane")}
            disabled={
              busyKey === "status" ||
              busyKey === "status:next" ||
              busyKey === "status:lane"
            }
          >
            {busyKey === "status:lane"
              ? localized(locale, { en: "Updating...", es: "Actualizando..." })
              : localized(locale, {
                  en: "Commit and open selected lane",
                  es: "Confirmar y abrir la cola seleccionada",
                })}
          </button>
        </div>
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Evidence", es: "Evidencia" })}
          </span>
          <h2>
            {localized(locale, {
              en: "Reliability review",
              es: "Revisión de confiabilidad",
            })}
          </h2>
        </div>

        {activity.evidences.length > 0 ? (
          <div className="queue-list">
            {activity.evidences.map((evidence) => (
              <article key={evidence.id} className="backoffice-card">
                <div className="backoffice-card__header">
                  <div>
                    <h3>{evidence.title}</h3>
                    <p>{evidence.summary ?? "-"}</p>
                  </div>
                  <div className="profile-chips">
                    <span className="status-pill">
                      {formatEditorialStatus(evidence.editorialStatus, locale)}
                    </span>
                    <span className="tag-chip tag-chip--muted">
                      {evidence.reliabilityFlag ?? localized(locale, { en: "not marked", es: "sin marca" })}
                    </span>
                  </div>
                </div>

                <label className="comment-form">
                  <span>{localized(locale, { en: "Reliability rationale", es: "Fundamento de confiabilidad" })}</span>
                  <textarea
                    value={evidenceReasons[evidence.id] ?? ""}
                    onChange={(event) =>
                      setEvidenceReasons((current) => ({
                        ...current,
                        [evidence.id]: event.target.value,
                      }))
                    }
                    rows={3}
                  />
                </label>

                <div className="action-row">
                  {RELIABILITY_FLAGS.map((flag) => {
                    const key = `evidence:${evidence.id}:${flag}`;

                    return (
                      <button
                        key={flag}
                        type="button"
                        className="button button--ghost"
                        onClick={() => void markEvidenceReliability(evidence.id, flag)}
                        disabled={busyKey === key}
                      >
                        {busyKey === key
                          ? localized(locale, { en: "Saving...", es: "Guardando..." })
                          : flag}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <p>
              {localized(locale, {
                en: "This activity still has no linked evidence to review.",
                es: "Esta actividad todavía no tiene evidencia vinculada para revisar.",
              })}
            </p>
          </div>
        )}
      </section>

      <section className="glass-panel page-stack">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "History", es: "Historial" })}
          </span>
          <h2>
            {localized(locale, {
              en: "Recent editorial decisions",
              es: "Decisiones editoriales recientes",
            })}
          </h2>
        </div>

        {activity.editorialHistory.length > 0 ? (
          <div className="queue-list">
            {activity.editorialHistory.map((entry) => (
              <article key={entry.id} className="backoffice-card">
                <div className="backoffice-card__header">
                  <div>
                    <h3>{entry.actor.displayName}</h3>
                    <p>{entry.actor.email}</p>
                  </div>
                  <span className="tag-chip tag-chip--muted">
                    {formatDate(entry.createdAt, locale)}
                  </span>
                </div>
                <ul className="muted-list">
                  <li>
                    {localized(locale, {
                      en: "Official AI status",
                      es: "Estado IA oficial",
                    })}: {String(entry.previousOfficialAiStatus ?? "-")} to{" "}
                    {String(entry.newOfficialAiStatus ?? "-")}
                  </li>
                  <li>
                    {localized(locale, {
                      en: "Editorial state",
                      es: "Estado editorial",
                    })}: {formatEditorialStatus(entry.previousEditorialStatus ?? "-", locale)} to{" "}
                    {formatEditorialStatus(entry.newEditorialStatus ?? "-", locale)}
                  </li>
                </ul>
                <p>{entry.rationale}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <p>
              {localized(locale, {
                en: "No editorial decisions have been logged yet.",
                es: "Todavía no hay decisiones editoriales registradas.",
              })}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
