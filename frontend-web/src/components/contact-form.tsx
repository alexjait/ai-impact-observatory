"use client";

import { useCallback, useState } from "react";

import { TurnstileWidget, getCaptchaRequiredMessage } from "@/components/turnstile-widget";
import { resolveApiErrorMessage } from "@/lib/api-errors";
import { type Locale, localized } from "@/lib/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

type ContactFormProps = {
  locale: Locale;
  initialName?: string;
  initialEmail?: string;
};

export function ContactForm({
  locale,
  initialName = "",
  initialEmail = "",
}: ContactFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCaptchaTokenChange = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) {
      return;
    }

    setBusy(true);
    setFeedback(null);
    setError(null);

    try {
      if (!captchaToken) {
        throw new Error(getCaptchaRequiredMessage(locale));
      }

      const response = await fetch(`${API_BASE_URL}/contact/messages`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || undefined,
          message: message.trim(),
          captchaToken,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await resolveApiErrorMessage(
            response,
            locale,
            localized(locale, {
              en: "Your message could not be sent.",
              es: "No se pudo enviar tu mensaje.",
            }),
          ),
        );
      }

      setFeedback(
        localized(locale, {
          en: "Message sent. Thanks for reaching out.",
          es: "Mensaje enviado. Gracias por escribir.",
        }),
      );
      setSubject("");
      setMessage("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : localized(locale, {
              en: "Unexpected contact error.",
              es: "Error inesperado al enviar el contacto.",
            }),
      );
    } finally {
      setCaptchaToken(null);
      setCaptchaResetTrigger((current) => current + 1);
      setBusy(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid-two">
        <label className="comment-form">
          <span>{localized(locale, { en: "Name", es: "Nombre" })}</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={localized(locale, {
              en: "How should we call you?",
              es: "¿Cómo te llamamos?",
            })}
            required
          />
        </label>
        <label className="comment-form">
          <span>{localized(locale, { en: "Email", es: "Email" })}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            required
          />
        </label>
      </div>

      <label className="comment-form">
        <span>{localized(locale, { en: "Subject", es: "Asunto" })}</span>
        <input
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder={localized(locale, {
            en: "What is this about?",
            es: "¿Sobre qué querés escribir?",
          })}
        />
      </label>

      <label className="comment-form">
        <span>{localized(locale, { en: "Message", es: "Mensaje" })}</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={7}
          placeholder={localized(locale, {
            en: "Tell us what you need, saw, or would like to suggest.",
            es: "Contanos qué necesitás, qué viste o qué te gustaría sugerir.",
          })}
          required
        />
      </label>

      <TurnstileWidget
        locale={locale}
        action="contact"
        onTokenChange={handleCaptchaTokenChange}
        resetTrigger={captchaResetTrigger}
      />

      {feedback ? <p className="form-feedback form-feedback--success">{feedback}</p> : null}
      {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

      <button
        type="submit"
        className="button button--solid"
        disabled={busy || !captchaToken}
      >
        {busy
          ? localized(locale, { en: "Sending...", es: "Enviando..." })
          : localized(locale, { en: "Send message", es: "Enviar mensaje" })}
      </button>
    </form>
  );
}
