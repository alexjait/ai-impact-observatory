"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { resolveApiErrorMessage } from "@/lib/api-errors";
import { type Locale, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

type FollowToggleButtonProps = {
  activityId: string;
  locale: Locale;
  initialIsFollowing: boolean;
  compact?: boolean;
};

export function FollowToggleButton({
  activityId,
  locale,
  initialIsFollowing,
  compact = false,
}: FollowToggleButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    if (isBusy) {
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/me/followed-activities/${activityId}`,
        {
          method: isFollowing ? "DELETE" : "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(
          await resolveApiErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "Could not update activity follow state.",
              es: "No se pudo actualizar el seguimiento de la actividad.",
            }),
          ),
        );
      }

      const body = (await response.json().catch(() => null)) as
        | { isFollowing?: boolean }
        | null;
      setIsFollowing(Boolean(body?.isFollowing));
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected follow error.",
              es: "Error inesperado al seguir la actividad.",
            }),
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className={`follow-toggle${compact ? " follow-toggle--compact" : ""}`}>
      <button
        type="button"
        className={`button ${isFollowing ? "button--ghost" : "button--solid"}`}
        onClick={() => void handleToggle()}
        disabled={isBusy}
      >
        {isBusy
          ? localized(locale, {
              en: "Saving...",
              es: "Guardando...",
            })
          : isFollowing
            ? localized(locale, {
                en: "Following",
                es: "Siguiendo",
              })
            : localized(locale, {
                en: "Follow",
                es: "Seguir",
              })}
      </button>
      {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}
    </div>
  );
}
