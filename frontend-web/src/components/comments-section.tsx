"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { type AuthenticatedUser, type CommentThread } from "@/lib/api";
import { resolveApiErrorMessage } from "@/lib/api-errors";
import { type Locale, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

type CommentsSectionProps = {
  locale: Locale;
  user: AuthenticatedUser | null;
  entityKind: "activity" | "evidence";
  entityId: string;
  comments: CommentThread[];
};

type ReportState = Record<string, { reason: string; details: string }>;
type ReplyState = Record<string, string>;

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function CommentItem({
  comment,
  locale,
  user,
  replyDraft,
  reportDraft,
  onReplyDraftChange,
  onReportDraftChange,
  onSubmitReply,
  onSubmitReport,
  busyKey,
}: {
  comment: CommentThread;
  locale: Locale;
  user: AuthenticatedUser | null;
  replyDraft: string;
  reportDraft: { reason: string; details: string };
  onReplyDraftChange: (value: string) => void;
  onReportDraftChange: (value: { reason: string; details: string }) => void;
  onSubmitReply: () => Promise<void>;
  onSubmitReport: () => Promise<void>;
  busyKey: string | null;
}) {
  return (
    <article className="comment-card">
      <div className="comment-card__header">
        <strong>{comment.author.displayName}</strong>
        <span>{formatDate(comment.createdAt, locale)}</span>
      </div>
      <p>{comment.text}</p>

      {user ? (
        <div className="comment-card__actions">
          <div className="comment-form">
            <label>
              <span>{localized(locale, { en: "Reply", es: "Responder" })}</span>
              <textarea
                value={replyDraft}
                onChange={(event) => onReplyDraftChange(event.target.value)}
                rows={3}
              />
            </label>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => void onSubmitReply()}
              disabled={busyKey === `reply:${comment.id}`}
            >
              {busyKey === `reply:${comment.id}`
                ? localized(locale, { en: "Sending...", es: "Enviando..." })
                : localized(locale, { en: "Post reply", es: "Publicar respuesta" })}
            </button>
          </div>

          {user.id !== comment.author.id ? (
            <div className="comment-form">
              <label>
                <span>{localized(locale, { en: "Report reason", es: "Motivo de denuncia" })}</span>
                <input
                  value={reportDraft.reason}
                  onChange={(event) =>
                    onReportDraftChange({
                      ...reportDraft,
                      reason: event.target.value,
                    })
                  }
                  placeholder={localized(locale, {
                    en: "spam, abuse, off-topic...",
                    es: "spam, abuso, fuera de tema...",
                  })}
                />
              </label>
              <label>
                <span>{localized(locale, { en: "Details", es: "Detalles" })}</span>
                <textarea
                  value={reportDraft.details}
                  onChange={(event) =>
                    onReportDraftChange({
                      ...reportDraft,
                      details: event.target.value,
                    })
                  }
                  rows={2}
                />
              </label>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => void onSubmitReport()}
                disabled={busyKey === `report:${comment.id}`}
              >
                {busyKey === `report:${comment.id}`
                  ? localized(locale, { en: "Reporting...", es: "Denunciando..." })
                  : localized(locale, { en: "Report comment", es: "Denunciar comentario" })}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {comment.replies.length > 0 ? (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <article key={reply.id} className="comment-card comment-card--reply">
              <div className="comment-card__header">
                <strong>{reply.author.displayName}</strong>
                <span>{formatDate(reply.createdAt, locale)}</span>
              </div>
              <p>{reply.text}</p>
            </article>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function CommentsSection({
  locale,
  user,
  entityKind,
  entityId,
  comments: initialComments,
}: CommentsSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<ReplyState>({});
  const [reportDrafts, setReportDrafts] = useState<ReportState>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const postPath =
    entityKind === "activity"
      ? `/activities/${entityId}/comments`
      : `/evidence/${entityId}/comments`;

  async function postComment(text: string, parentCommentId?: string) {
    const response = await fetch(`${API_BASE_URL}${postPath}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        parentCommentId,
      }),
    });

    if (!response.ok) {
      throw new Error(
        await resolveApiErrorMessage(
          response,
          locale,
          localized(locale, {
            en: "Could not publish the comment.",
            es: "No se pudo publicar el comentario.",
          }),
        ),
      );
    }

    return (await response.json()) as CommentThread;
  }

  async function handleSubmitTopLevel() {
    if (!draft.trim()) {
      return;
    }

    setError(null);
    setFeedback(null);
    setBusyKey("top-level");

    try {
      const created = await postComment(draft);
      setComments((current) => [...current, created]);
      setDraft("");
      setFeedback(
        localized(locale, {
          en: "Comment published.",
          es: "Comentario publicado.",
        }),
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected comment error.",
              es: "Error inesperado de comentario.",
            }),
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function handleSubmitReply(commentId: string) {
    const value = replyDrafts[commentId]?.trim();
    if (!value) {
      return;
    }

    setError(null);
    setFeedback(null);
    setBusyKey(`reply:${commentId}`);

    try {
      const created = await postComment(value, commentId);
      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [
                  ...comment.replies,
                  {
                    id: created.id,
                    text: created.text,
                    createdAt: created.createdAt,
                    parentCommentId: created.parentCommentId,
                    author: created.author,
                  },
                ],
              }
            : comment,
        ),
      );
      setReplyDrafts((current) => ({ ...current, [commentId]: "" }));
      setFeedback(
        localized(locale, {
          en: "Reply published.",
          es: "Respuesta publicada.",
        }),
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected reply error.",
              es: "Error inesperado de respuesta.",
            }),
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function handleReport(commentId: string) {
    const currentDraft = reportDrafts[commentId];
    if (!currentDraft?.reason?.trim()) {
      setError(
        localized(locale, {
          en: "Choose a report reason before sending.",
          es: "Completa un motivo antes de denunciar.",
        }),
      );
      return;
    }

    setError(null);
    setFeedback(null);
    setBusyKey(`report:${commentId}`);

    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}/report`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentDraft),
      });

      if (!response.ok) {
        throw new Error(
          await resolveApiErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "Could not report the comment.",
              es: "No se pudo denunciar el comentario.",
            }),
          ),
        );
      }

      setReportDrafts((current) => ({
        ...current,
        [commentId]: { reason: "", details: "" },
      }));
      setFeedback(
        localized(locale, {
          en: "Report submitted.",
          es: "Denuncia enviada.",
        }),
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected report error.",
              es: "Error inesperado de denuncia.",
            }),
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <section className="glass-panel page-stack">
      <div className="section-header">
        <div>
          <span className="eyebrow">
            {localized(locale, { en: "Community", es: "Comunidad" })}
          </span>
          <h2>
            {localized(locale, {
              en: "Comments",
              es: "Comentarios",
            })}
          </h2>
        </div>
      </div>

      {user ? (
        <div className="comment-form">
          <label>
            <span>
              {localized(locale, {
                en: "Add your comment",
                es: "Agrega tu comentario",
              })}
            </span>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
            />
          </label>
          <button
            type="button"
            className="button button--solid"
            onClick={() => void handleSubmitTopLevel()}
            disabled={busyKey === "top-level"}
          >
            {busyKey === "top-level"
              ? localized(locale, { en: "Publishing...", es: "Publicando..." })
              : localized(locale, { en: "Publish comment", es: "Publicar comentario" })}
          </button>
        </div>
      ) : (
        <p>
          {localized(locale, {
            en: "Only authenticated users can participate from this block.",
            es: "Solo usuarios autenticados pueden participar desde este bloque.",
          })}
        </p>
      )}

      {feedback ? <p className="form-feedback form-feedback--success">{feedback}</p> : null}
      {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

      {comments.length > 0 ? (
        <div className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              locale={locale}
              user={user}
              replyDraft={replyDrafts[comment.id] ?? ""}
              reportDraft={reportDrafts[comment.id] ?? { reason: "", details: "" }}
              onReplyDraftChange={(value) =>
                setReplyDrafts((current) => ({ ...current, [comment.id]: value }))
              }
              onReportDraftChange={(value) =>
                setReportDrafts((current) => ({ ...current, [comment.id]: value }))
              }
              onSubmitReply={() => handleSubmitReply(comment.id)}
              onSubmitReport={() => handleReport(comment.id)}
              busyKey={busyKey}
            />
          ))}
        </div>
      ) : (
        <div className="empty-panel">
          <p>
            {localized(locale, {
              en: "No community comments yet.",
              es: "Todavia no hay comentarios de la comunidad.",
            })}
          </p>
        </div>
      )}
    </section>
  );
}
