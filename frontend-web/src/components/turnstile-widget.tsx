"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

import { type Locale, localized } from "@/lib/site";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          language?: string;
          theme?: "auto" | "light" | "dark";
          size?: "normal" | "compact" | "flexible";
          callback?: (token: string) => void;
          "error-callback"?: (errorCode?: string) => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
          "response-field"?: boolean;
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-api";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileWidgetProps = {
  locale: Locale;
  action: "login" | "register" | "forgot_password" | "reset_password" | "contact";
  onTokenChange: (token: string | null) => void;
  resetTrigger?: number;
};

export function getCaptchaRequiredMessage(locale: Locale): string {
  return localized(locale, {
    en: "Complete the security check before continuing.",
    es: "Completá la verificación de seguridad antes de continuar.",
  });
}

export function TurnstileWidget({
  locale,
  action,
  onTokenChange,
  resetTrigger = 0,
}: TurnstileWidgetProps) {
  const widgetContainerId = useId().replace(/:/g, "");
  const widgetIdRef = useRef<string | null>(null);
  const resetCountRef = useRef(resetTrigger);
  const resetVersionRef = useRef(resetTrigger);
  const [scriptReady, setScriptReady] = useState(() =>
    typeof window !== "undefined" ? Boolean(window.turnstile) : false,
  );
  const [statusState, setStatusState] = useState<{
    resetVersion: number;
    message: string;
  } | null>(null);

  const statusMessage =
    statusState && statusState.resetVersion === resetTrigger ? statusState.message : null;

  useEffect(() => {
    if (!scriptReady || !TURNSTILE_SITE_KEY || widgetIdRef.current || !window.turnstile) {
      return;
    }

    const widgetId = window.turnstile.render(`#${widgetContainerId}`, {
      sitekey: TURNSTILE_SITE_KEY,
      action,
      language: locale,
      size: "flexible",
      theme: "light",
      "response-field": false,
      callback(token) {
        setStatusState(null);
        onTokenChange(token);
      },
      "expired-callback"() {
        onTokenChange(null);
        setStatusState({
          resetVersion: resetVersionRef.current,
          message: localized(locale, {
            en: "The security check expired. Please complete it again.",
            es: "La verificación de seguridad expiró. Completala nuevamente.",
          }),
        });
        window.turnstile?.reset(widgetId);
      },
      "timeout-callback"() {
        onTokenChange(null);
        setStatusState({
          resetVersion: resetVersionRef.current,
          message: localized(locale, {
            en: "The security check timed out. Please try again.",
            es: "La verificación de seguridad agotó el tiempo. Intentá de nuevo.",
          }),
        });
        window.turnstile?.reset(widgetId);
      },
      "error-callback"() {
        onTokenChange(null);
        setStatusState({
          resetVersion: resetVersionRef.current,
          message: localized(locale, {
            en: "We could not load the security check. Please try again.",
            es: "No pudimos cargar la verificación de seguridad. Intentá de nuevo.",
          }),
        });
        window.turnstile?.reset(widgetId);
      },
    });

    widgetIdRef.current = widgetId;

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      onTokenChange(null);
    };
  }, [action, locale, onTokenChange, scriptReady, widgetContainerId]);

  useEffect(() => {
    if (
      resetTrigger === resetCountRef.current ||
      !widgetIdRef.current ||
      !window.turnstile
    ) {
      return;
    }

    resetCountRef.current = resetTrigger;
    resetVersionRef.current = resetTrigger;
    onTokenChange(null);
    window.turnstile.reset(widgetIdRef.current);
  }, [onTokenChange, resetTrigger]);

  if (!TURNSTILE_SITE_KEY) {
    return (
      <div className="turnstile-shell turnstile-shell--error">
        <p className="turnstile-shell__hint">
          {localized(locale, {
            en: "Security check is unavailable. Configure NEXT_PUBLIC_TURNSTILE_SITE_KEY.",
            es: "La verificación de seguridad no está disponible. Configurá NEXT_PUBLIC_TURNSTILE_SITE_KEY.",
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="turnstile-shell">
      <Script
        id={TURNSTILE_SCRIPT_ID}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div id={widgetContainerId} className="turnstile-shell__frame" />
      {statusMessage ? (
        <p className="turnstile-shell__hint turnstile-shell__hint--error">{statusMessage}</p>
      ) : null}
    </div>
  );
}
