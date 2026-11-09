"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ContactMessage, ContactMessageListResponse } from "@/lib/api";
import { resolveApiErrorMessage } from "@/lib/api-errors";
import { type Locale, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

type ContactInboxPanelProps = {
  locale: Locale;
  inbox: ContactMessageListResponse;
};

export function ContactInboxPanel({ locale, inbox }: ContactInboxPanelProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function formatMessageStatus(status: ContactMessage["status"]) {
    if (status === "read") {
      return localized(locale, { en: "Read", es: "Leído" });
    }

    if (status === "archived") {
      return localized(locale, { en: "Archived", es: "Archivado" });
    }

    return localized(locale, { en: "New", es: "Nuevo" });
  }

  async function updateStatus(id: string, status: ContactMessage["status"]) {
    if (busyId) {
      return;
    }

    setBusyId(id);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/contact/messages/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(
          await resolveApiErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "Could not update contact message status.",
              es: "No se pudo actualizar el estado del mensaje.",
            }),
          ),
        );
      }

      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : localized(locale, {
              en: "Unexpected contact inbox error.",
              es: "Error inesperado en la bandeja de contacto.",
            }),
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page-stack">
      <div className="backoffice-metric-grid">
        <article className="metric-card metric-card--positive">
          <strong>{inbox.summary.new}</strong>
          <span>{localized(locale, { en: "new", es: "nuevos" })}</span>
        </article>
        <article className="metric-card">
          <strong>{inbox.summary.read}</strong>
          <span>{localized(locale, { en: "read", es: "leídos" })}</span>
        </article>
        <article className="metric-card">
          <strong>{inbox.summary.archived}</strong>
          <span>{localized(locale, { en: "archived", es: "archivados" })}</span>
        </article>
      </div>

      {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

      {inbox.items.length ? (
        <div className="queue-list">
          {inbox.items.map((item) => (
            <article key={item.id} className="backoffice-card">
              <div className="backoffice-card__header">
                <div>
                  <h2>{item.subject || localized(locale, { en: "No subject", es: "Sin asunto" })}</h2>
                  <p>
                    {item.name} / {item.email}
                  </p>
                </div>
                <div className="profile-chips">
                  <span className="status-pill">{formatMessageStatus(item.status)}</span>
                </div>
              </div>

              <ul className="muted-list">
                <li>
                  {localized(locale, { en: "Received", es: "Recibido" })}:{" "}
                  {new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(item.createdAt))}
                </li>
                {item.author ? (
                  <li>
                    {localized(locale, {
                      en: "Linked account",
                      es: "Cuenta asociada",
                    })}
                    : {` ${item.author.displayName} / ${item.author.email}`}
                  </li>
                ) : null}
              </ul>

              <p className="section-copy">{item.message}</p>

              <div className="action-row">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => void updateStatus(item.id, "new")}
                  disabled={busyId === item.id}
                >
                  {localized(locale, { en: "Mark new", es: "Marcar nuevo" })}
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => void updateStatus(item.id, "read")}
                  disabled={busyId === item.id}
                >
                  {localized(locale, { en: "Mark read", es: "Marcar leído" })}
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => void updateStatus(item.id, "archived")}
                  disabled={busyId === item.id}
                >
                  {localized(locale, { en: "Archive", es: "Archivar" })}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-panel">
          <p>
            {localized(locale, {
              en: "There are no contact messages for this filter right now.",
              es: "No hay mensajes de contacto para este filtro en este momento.",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
