export type Locale = "en" | "es";

export type SearchParamsInput =
  | Record<string, string | string[] | undefined>
  | URLSearchParams;

export function resolveLocale(value?: string | string[]): Locale {
  const locale = Array.isArray(value) ? value[0] : value;
  return locale === "es" ? "es" : "en";
}

export function readParam(
  input: SearchParamsInput,
  key: string,
): string | undefined {
  if (input instanceof URLSearchParams) {
    return input.get(key) ?? undefined;
  }

  const value = input[key];
  return Array.isArray(value) ? value[0] : value;
}

export function localized<T>(locale: Locale, messages: { en: T; es: T }): T {
  return locale === "es" ? messages.es : messages.en;
}

export function buildPath(
  path: string,
  locale: Locale,
  extra?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  params.set("locale", locale);

  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function formatAiStatus(
  value: number | null | undefined,
  locale: Locale,
): string {
  if (typeof value !== "number") {
    return localized(locale, {
      en: "Editorial review pending",
      es: "Revisión editorial pendiente",
    });
  }

  const labels = {
    0: localized(locale, {
      en: "0 | No relevant impact",
      es: "0 | Sin impacto relevante",
    }),
    1: localized(locale, {
      en: "1 | Occasional assistance",
      es: "1 | Asistencia puntual",
    }),
    2: localized(locale, {
      en: "2 | Productivity increase",
      es: "2 | Aumento de productividad",
    }),
    3: localized(locale, {
      en: "3 | Partial replacement",
      es: "3 | Reemplazo parcial",
    }),
    4: localized(locale, {
      en: "4 | Majority replacement",
      es: "4 | Reemplazo mayoritario",
    }),
    5: localized(locale, {
      en: "5 | Near-total replacement",
      es: "5 | Reemplazo casi total",
    }),
  } as const;

  return labels[value as keyof typeof labels] ?? String(value);
}

export function formatEditorialStatus(value: string, locale: Locale): string {
  const labels: Record<string, { en: string; es: string }> = {
    pending: { en: "Pending", es: "Pendiente" },
    approved: { en: "Approved", es: "Aprobada" },
    rejected: { en: "Rejected", es: "Rechazada" },
    needs_correction: { en: "Needs correction", es: "Requiere corrección" },
    reported: { en: "Reported", es: "Denunciado" },
    under_review: { en: "Under review", es: "En revisión" },
    resolved: { en: "Resolved", es: "Resuelto" },
    visible: { en: "Visible", es: "Visible" },
    hidden: { en: "Hidden", es: "Oculto" },
    archived: { en: "Archived", es: "Archivado" },
  };

  const message = labels[value];
  if (!message) {
    return value;
  }

  return localized(locale, message);
}

export function formatGranularity(value: string, locale: Locale): string {
  const labels: Record<string, { en: string; es: string }> = {
    tarea: { en: "Task", es: "Tarea" },
    funcion: { en: "Function", es: "Función" },
    rol: { en: "Role", es: "Rol" },
    profesion: { en: "Profession", es: "Profesión" },
  };

  const message = labels[value];
  if (!message) {
    return value;
  }

  return localized(locale, message);
}

export function formatDate(value: string | null | undefined, locale: Locale): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}
