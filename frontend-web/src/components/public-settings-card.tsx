"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { type PublicSettings } from "@/lib/api";
import { resolveApiErrorMessage } from "@/lib/api-errors";
import { type Locale, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

type PublicSettingsCardProps = {
  locale: Locale;
  settings: PublicSettings;
};

export function PublicSettingsCard({
  locale,
  settings,
}: PublicSettingsCardProps) {
  const router = useRouter();
  const [publicCommentsEnabled, setPublicCommentsEnabled] = useState(
    settings.publicCommentsEnabled,
  );
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/public-settings`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicCommentsEnabled }),
      });

      if (!response.ok) {
        throw new Error(
          await resolveApiErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "Could not update the public experience settings.",
              es: "No se pudo actualizar la configuracion publica.",
            }),
          ),
        );
      }

      setFeedback(
        localized(locale, {
          en: "Public setting saved.",
          es: "Configuracion publica guardada.",
        }),
      );
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : localized(locale, {
              en: "Unexpected settings error.",
              es: "Error inesperado de configuracion.",
            }),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="backoffice-card">
      <div className="backoffice-card__header">
        <div>
          <h2>{localized(locale, { en: "Public experience", es: "Experiencia publica" })}</h2>
          <p>
            {localized(locale, {
              en: "This switch only affects public activity and evidence pages. Moderation and backoffice keep working normally.",
              es: "Este switch solo afecta las paginas publicas de actividad y evidencia. Moderacion y backoffice siguen funcionando igual.",
            })}
          </p>
        </div>
      </div>

      <label className="toggle-card">
        <div>
          <strong>
            {localized(locale, {
              en: "Show comments and reports publicly",
              es: "Mostrar comentarios y denuncias en el frontend publico",
            })}
          </strong>
          <p className="section-copy">
            {localized(locale, {
              en: "If you turn this off, visitors will only see the evidence contribution path from activity detail.",
              es: "Si lo desactivas, los visitantes solo veran la via para proponer nueva evidencia desde el detalle de actividad.",
            })}
          </p>
        </div>
        <input
          type="checkbox"
          checked={publicCommentsEnabled}
          onChange={(event) => setPublicCommentsEnabled(event.target.checked)}
        />
      </label>

      {feedback ? <p className="form-feedback form-feedback--success">{feedback}</p> : null}
      {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

      <div className="action-row">
        <button
          type="button"
          className="button button--solid"
          onClick={() => void save()}
          disabled={busy}
        >
          {busy
            ? localized(locale, { en: "Saving...", es: "Guardando..." })
            : localized(locale, { en: "Save setting", es: "Guardar configuracion" })}
        </button>
      </div>
    </article>
  );
}
