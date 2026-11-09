import { cache } from "react";
import { cookies } from "next/headers";

import { type Locale } from "./site";

export type AuthMethod = "local" | "google";

export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  sessionId: string;
  authMethods: AuthMethod[];
  hasLocalPassword: boolean;
};

export type ActivityCard = {
  id: string;
  key: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  editorialSummary?: string | null;
  granularity: string;
  officialAiStatus: number | null;
  editorialStatus: string;
  isPubliclyVisible: boolean;
  isFollowing: boolean;
  followedAt?: string | null;
  industries: string[];
  categories: string[];
};

export type ActivityDetail = {
  id: string;
  key: string;
  granularity: string;
  officialAiStatus: number | null;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  editorialSummary: string | null;
  isFollowing: boolean;
  publicFeatures: {
    commentsEnabled: boolean;
  };
  industries: Array<{ key: string; name: string; slug: string }>;
  categories: Array<{ key: string; name: string; slug: string }>;
  evidences: EvidenceCard[];
  comments: CommentThread[];
  relatedActivities: unknown[];
};

export type EvidenceCard = {
  id: string;
  type: string;
  title: string;
  slug: string;
  summary: string | null;
  sourceText: string | null;
  sourceUrl: string | null;
  reliabilityFlag: string | null;
  eventDate: string | null;
  showReliabilityWarning?: boolean;
};

export type EvidenceDetail = {
  id: string;
  type: string;
  title: string | null;
  slug: string | null;
  summary: string | null;
  context: string | null;
  sourceText: string | null;
  sourceUrl: string | null;
  eventDate: string | null;
  reliabilityFlag: string | null;
  publicFeatures: {
    commentsEnabled: boolean;
  };
  activities: Array<{
    id: string;
    key: string;
    title: string;
    slug: string | null;
  }>;
  comments: CommentThread[];
};

export type Methodology = {
  title: string;
  summary: string;
  scale: string[];
  levels: Array<{
    value: number;
    label: string;
    description: string;
    example: string;
  }>;
};

export type TaxonomyCollection = {
  industries: Array<{ key: string; name: string; slug: string }>;
  categories: Array<{ key: string; name: string; slug: string }>;
};

export type Providers = {
  local: { enabled: boolean };
  google: { enabled: boolean };
};

export type PublicSettings = {
  publicCommentsEnabled: boolean;
  updatedAt: string;
  updatedByUserId: string | null;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    displayName: string;
    email: string;
  } | null;
};

export type ContactMessageListResponse = {
  items: ContactMessage[];
  total: number;
  page: number;
  pageSize: number;
  summary: {
    new: number;
    read: number;
    archived: number;
  };
};

export type ProposalInbox = {
  activityProposals: ProposalItem[];
  evidenceProposals: ProposalItem[];
  backendAvailable: boolean;
};

export type ProposalItem = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
};

export type ActivityProposalDetail = {
  id: string;
  status: string;
  moderationNote: string | null;
  granularity: "tarea" | "funcion" | "rol" | "profesion";
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  industryKeys: string[];
  categoryKeys: string[];
  translations: {
    en: {
      title: string;
      shortDescription: string | null;
      fullDescription: string | null;
    };
    es: {
      title: string;
      shortDescription: string | null;
      fullDescription: string | null;
    };
  };
};

export type EvidenceProposalDetail = {
  id: string;
  status: string;
  moderationNote: string | null;
  type: string;
  sourceText: string;
  sourceUrl: string | null;
  eventDate: string | null;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  activityKeys: string[];
  translations: {
    en: {
      title: string;
      summary: string | null;
      context: string | null;
    };
    es: {
      title: string;
      summary: string | null;
      context: string | null;
    };
  };
};

export type ModerationQueueType =
  | "activity_proposals"
  | "evidence_proposals"
  | "comments"
  | "activities";

export type ModerationQueueSummary = {
  pendingActivityProposals: number;
  pendingEvidenceProposals: number;
  reportedComments: number;
  pendingActivities: number;
};

export type ModerationQueueAuthor = {
  id: string;
  displayName: string;
  email: string;
};

export type ModerationQueueActivityProposalItem = {
  id: string;
  title: string;
  status: string;
  moderationNote: string | null;
  granularity: string;
  createdAt: string;
  author: ModerationQueueAuthor;
  industryKeys: string[];
  categoryKeys: string[];
  translationPreview: {
    en: {
      title?: string | null;
      shortDescription?: string | null;
      fullDescription?: string | null;
    } | null;
    es: {
      title?: string | null;
      shortDescription?: string | null;
      fullDescription?: string | null;
    } | null;
  };
};

export type ModerationQueueEvidenceProposalItem = {
  id: string;
  title: string;
  status: string;
  moderationNote: string | null;
  type: string;
  sourceText: string;
  sourceUrl: string | null;
  eventDate: string | null;
  createdAt: string;
  author: ModerationQueueAuthor;
  activityKeys: string[];
  translationPreview: {
    en: {
      title?: string | null;
      summary?: string | null;
      context?: string | null;
    } | null;
    es: {
      title?: string | null;
      summary?: string | null;
      context?: string | null;
    } | null;
  };
};

export type ModerationQueueCommentItem = {
  id: string;
  text: string;
  createdAt: string;
  reportStatus: string;
  visibilityStatus: string;
  author: ModerationQueueAuthor;
  target: {
    activityId: string | null;
    evidenceId: string | null;
    parentCommentId: string | null;
    activity: {
      id: string;
      key: string;
      title: string;
      slug: string | null;
    } | null;
    evidence: {
      id: string;
      type: string;
      title: string;
      slug: string | null;
      activityKeys: string[];
      activityTitles: string[];
    } | null;
  };
  reports: Array<{
    id: string;
    reason: string;
    details: string | null;
    createdAt: string;
    reporter: ModerationQueueAuthor;
  }>;
};

export type ModerationQueueActivityItem = {
  id: string;
  key: string;
  title: string;
  status: string;
  officialAiStatus: number | null;
  hasEditorialSummary: boolean;
  evidenceCount?: number;
  updatedAt: string;
};

export type ModerationActivityProposalDetail = {
  id: string;
  title: string;
  granularity: string;
  editorialStatus: string;
  moderationNote: string | null;
  createdAt: string;
  updatedAt: string;
  author: ModerationQueueAuthor;
  industryKeys: string[];
  categoryKeys: string[];
  industries: Array<{ key: string; name: string; slug: string }>;
  categories: Array<{ key: string; name: string; slug: string }>;
  translations: {
    en: {
      title: string | null;
      shortDescription: string | null;
      fullDescription: string | null;
    };
    es: {
      title: string | null;
      shortDescription: string | null;
      fullDescription: string | null;
    };
  };
  moderationHistory: Array<{
    id: string;
    actionType: string;
    reason: string;
    createdAt: string;
    actor: ModerationQueueAuthor;
  }>;
};

export type ModerationEvidenceProposalDetail = {
  id: string;
  title: string;
  type: string;
  sourceText: string;
  sourceUrl: string | null;
  eventDate: string | null;
  editorialStatus: string;
  moderationNote: string | null;
  createdAt: string;
  updatedAt: string;
  author: ModerationQueueAuthor;
  activityKeys: string[];
  activities: Array<{
    id: string;
    key: string;
    title: string;
    slug: string | null;
  }>;
  translations: {
    en: {
      title: string | null;
      summary: string | null;
      context: string | null;
    };
    es: {
      title: string | null;
      summary: string | null;
      context: string | null;
    };
  };
  moderationHistory: Array<{
    id: string;
    actionType: string;
    reason: string;
    createdAt: string;
    actor: ModerationQueueAuthor;
  }>;
};

export type ModerationQueueResponse = {
  summary: ModerationQueueSummary;
  type: ModerationQueueType;
  items: Array<
    | ModerationQueueActivityProposalItem
    | ModerationQueueEvidenceProposalItem
    | ModerationQueueCommentItem
    | ModerationQueueActivityItem
  >;
  total: number;
  page: number;
  pageSize: number;
};

export type EditorialActivityListItem = {
  id: string;
  key: string;
  title: string;
  slug: string;
  editorialStatus: string;
  officialAiStatus: number | null;
  hasEditorialSummary: boolean;
  evidenceCount: number;
  industryKeys: string[];
  categoryKeys: string[];
  industryNames: Array<{ key: string; name: string; slug: string }>;
  categoryNames: Array<{ key: string; name: string; slug: string }>;
  completionSignals: {
    hasEditorialSummaryEn: boolean;
    hasEditorialSummaryEs: boolean;
    hasEvidence: boolean;
  };
  lastEditorialActionAt: string | null;
  updatedAt: string;
};

export type EditorialActivityListResponse = {
  items: EditorialActivityListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type EditorialBulkStatusResult = {
  id: string;
  key: string | null;
  result: "updated" | "skipped" | "not_found";
  previousEditorialStatus: string | null;
  newEditorialStatus: string | null;
  previousOfficialAiStatus: number | null;
  newOfficialAiStatus: number | null;
  reason: string | null;
};

export type EditorialBulkStatusResponse = {
  requestedCount: number;
  processedCount: number;
  skippedCount: number;
  notFoundCount: number;
  editorialStatus: string;
  officialAiStatusApplied: number | null;
  results: EditorialBulkStatusResult[];
};

export type EditorialActivityDetail = {
  id: string;
  key: string;
  granularity: string;
  editorialStatus: string;
  officialAiStatus: number | null;
  title: string;
  slug: string;
  translations: {
    en: {
      title: string;
      shortDescription: string | null;
      fullDescription: string | null;
      editorialSummary: string | null;
      slug: string | null;
    };
    es: {
      title: string;
      shortDescription: string | null;
      fullDescription: string | null;
      editorialSummary: string | null;
      slug: string | null;
    };
  };
  industries: Array<{ key: string; name: string; slug: string }>;
  categories: Array<{ key: string; name: string; slug: string }>;
  completionSignals: {
    hasEditorialSummaryEn: boolean;
    hasEditorialSummaryEs: boolean;
    hasEvidence: boolean;
  };
  reviewNavigation: {
    laneStatus: string;
    totalInLane: number;
    previousId: string | null;
    nextId: string | null;
  };
  evidences: Array<{
    id: string;
    editorialStatus: string;
    reliabilityFlag: string | null;
    title: string;
    slug: string | null;
    summary: string | null;
  }>;
  editorialHistory: Array<{
    id: string;
    previousOfficialAiStatus: number | null;
    newOfficialAiStatus: number | null;
    previousEditorialStatus: string | null;
    newEditorialStatus: string | null;
    rationale: string;
    createdAt: string;
    actor: ModerationQueueAuthor;
  }>;
};

export type EditorialCatalogReferenceOption = {
  id?: string;
  key: string;
  name?: string;
  title?: string;
  slug: string;
  editorialStatus?: string;
};

export type EditorialCatalogReferences = {
  industries: Array<{ key: string; name: string; slug: string }>;
  categories: Array<{ key: string; name: string; slug: string }>;
  activities: Array<{
    id: string;
    key: string;
    title: string;
    slug: string;
    editorialStatus: string;
  }>;
};

export type EditorialCatalogActivityListItem = {
  id: string;
  key: string;
  title: string;
  slug: string;
  granularity: string;
  editorialStatus: string;
  officialAiStatus: number | null;
  evidenceCount: number;
  industryNames: string[];
  categoryNames: string[];
  updatedAt: string;
};

export type EditorialCatalogActivityListResponse = {
  items: EditorialCatalogActivityListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type EditorialCatalogActivityDetail = {
  id: string;
  key: string;
  title: string;
  slug: string;
  granularity: string;
  editorialStatus: string;
  officialAiStatus: number | null;
  translations: {
    en: {
      title: string;
      shortDescription: string | null;
      fullDescription: string | null;
      editorialSummary: string | null;
      slug: string | null;
    };
    es: {
      title: string;
      shortDescription: string | null;
      fullDescription: string | null;
      editorialSummary: string | null;
      slug: string | null;
    };
  };
  industries: Array<{ key: string; name: string; slug: string }>;
  categories: Array<{ key: string; name: string; slug: string }>;
  industryKeys: string[];
  categoryKeys: string[];
  evidences: Array<{
    id: string;
    key: string | null;
    title: string;
    slug: string | null;
    editorialStatus: string;
  }>;
  updatedAt: string;
};

export type EditorialCatalogEvidenceListItem = {
  id: string;
  key: string | null;
  title: string;
  slug: string;
  type: string;
  editorialStatus: string;
  reliabilityFlag: string | null;
  eventDate: string | null;
  activityCount: number;
  activityTitles: string[];
  updatedAt: string;
};

export type EditorialCatalogEvidenceListResponse = {
  items: EditorialCatalogEvidenceListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type EditorialCatalogEvidenceDetail = {
  id: string;
  key: string | null;
  title: string;
  slug: string;
  type: string;
  editorialStatus: string;
  reliabilityFlag: string | null;
  sourceText: string;
  sourceUrl: string | null;
  eventDate: string | null;
  activityIds: string[];
  activities: Array<{
    id: string;
    key: string;
    title: string;
    slug: string;
    editorialStatus: string;
  }>;
  translations: {
    en: {
      title: string;
      summary: string;
      context: string;
      slug: string | null;
    };
    es: {
      title: string;
      summary: string;
      context: string;
      slug: string | null;
    };
  };
  updatedAt: string;
};

export type CommentThread = {
  id: string;
  text: string;
  createdAt: string;
  parentCommentId?: string | null;
  author: {
    id: string;
    displayName: string;
  };
  replies: Array<{
    id: string;
    text: string;
    createdAt: string;
    parentCommentId?: string | null;
    author: {
      id: string;
      displayName: string;
    };
  }>;
};

const API_BASE_URL =
  process.env.API_INTERNAL_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3001/api/v1";

const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? "aiio_session";

type FetchOptions = RequestInit & {
  allowNotFound?: boolean;
  allowFailure?: boolean;
};

const RETRYABLE_METHODS = new Set(["GET", "HEAD"]);
const RETRY_DELAYS_MS = [150, 350];

// cache() deduplicates calls within a single SSR render pass.
// Any Server Component calling getSessionUser() in the same request
// shares the same resolved promise — no extra HTTP calls.
const getSessionHeaders = cache(async (): Promise<HeadersInit | undefined> => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionToken?.value) {
    return undefined;
  }

  return {
    Cookie: `${SESSION_COOKIE_NAME}=${sessionToken.value}`,
  };
});

async function fetchJson<T>(
  path: string,
  options?: FetchOptions,
): Promise<T | null> {
  const method = (options?.method ?? "GET").toUpperCase();
  const canRetry = RETRYABLE_METHODS.has(method);
  const maxAttempts = canRetry ? RETRY_DELAYS_MS.length + 1 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        cache: "no-store",
      });
    } catch (error) {
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt - 1]));
        continue;
      }

      if (options?.allowFailure) {
        console.error(`[api] Request failed for ${path}`, error);
        return null;
      }

      throw error;
    }

    if (response.status === 404 && options?.allowNotFound) {
      return null;
    }

    if (!response.ok) {
      if (attempt < maxAttempts && response.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt - 1]));
        continue;
      }

      if (options?.allowFailure) {
        let bodyText = "";
        try {
          bodyText = await response.text();
        } catch {
          bodyText = "";
        }
        console.error(
          `[api] Request failed for ${path} with status ${response.status}${bodyText ? `: ${bodyText}` : ""}`,
        );
        return null;
      }

      throw new Error(`Request failed for ${path} with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  return null;
}

export const getSessionUser = cache(async (): Promise<AuthenticatedUser | null> => {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  return fetchJson<AuthenticatedUser>("/me", {
    headers,
    allowNotFound: true,
    allowFailure: true,
  });
});

export async function getProviders(): Promise<Providers> {
  return (
    (await fetchJson<Providers>("/auth/providers", { allowFailure: true })) ?? {
      local: { enabled: true },
      google: { enabled: false },
    }
  );
}

export async function getActivities(input: {
  locale: Locale;
  page?: number;
  pageSize?: number;
  industry?: string;
  category?: string;
  aiStatus?: string;
  followed?: string;
  q?: string;
  sort?: "recent" | "title";
}): Promise<{ items: ActivityCard[]; total: number; page: number; pageSize: number }> {
  const headers = await getSessionHeaders();
  const params = new URLSearchParams();
  params.set("locale", input.locale);
  params.set("page", String(input.page ?? 1));
  params.set("pageSize", String(input.pageSize ?? 12));

  if (input.industry) params.set("industry", input.industry);
  if (input.category) params.set("category", input.category);
  if (input.aiStatus) params.set("aiStatus", input.aiStatus);
  if (input.followed) params.set("followed", input.followed);
  if (input.q) params.set("q", input.q);
  if (input.sort) params.set("sort", input.sort);

  const endpoint = input.q ? "/public/search" : "/public/activities";

  return (
    (await fetchJson<{
      items: ActivityCard[];
      total: number;
      page: number;
      pageSize: number;
    }>(`${endpoint}?${params.toString()}`, { allowFailure: true, headers })) ?? {
      items: [],
      total: 0,
      page: 1,
      pageSize: input.pageSize ?? 12,
    }
  );
}

export async function getAllActivities(input: {
  locale: Locale;
  industry?: string;
  category?: string;
  aiStatus?: string;
  followed?: string;
  q?: string;
  sort?: "recent" | "title";
}): Promise<ActivityCard[]> {
  const pageSize = 100;
  let page = 1;
  const collected: ActivityCard[] = [];

  while (true) {
    const batch = await getActivities({
      ...input,
      page,
      pageSize,
    });

    for (const item of batch.items) {
      if (!collected.some((candidate) => candidate.id === item.id)) {
        collected.push(item);
      }
    }

    if (!batch.items.length || page * batch.pageSize >= batch.total) {
      break;
    }

    page += 1;
  }

  return collected;
}

export async function getActivityBySlug(
  slug: string,
  locale: Locale,
): Promise<ActivityDetail | null> {
  const headers = await getSessionHeaders();
  return fetchJson<ActivityDetail>(
    `/public/activities/${slug}?locale=${locale}`,
    { allowNotFound: true, allowFailure: true, headers },
  );
}

export async function getEvidenceBySlug(
  idOrSlug: string,
  locale: Locale,
): Promise<EvidenceDetail | null> {
  return fetchJson<EvidenceDetail>(
    `/public/evidence/${idOrSlug}?locale=${locale}`,
    { allowNotFound: true, allowFailure: true },
  );
}

export async function getMethodology(locale: Locale): Promise<Methodology> {
  return (
    (await fetchJson<Methodology>(`/public/methodology?locale=${locale}`, { allowFailure: true })) ?? {
      title: "Methodology",
      summary: "",
      scale: [],
      levels: [],
    }
  );
}

export async function getTaxonomies(locale: Locale): Promise<TaxonomyCollection> {
  return (
    (await fetchJson<TaxonomyCollection>(`/public/taxonomies?locale=${locale}`, { allowFailure: true })) ?? {
      industries: [],
      categories: [],
    }
  );
}

export async function getProposalInbox(locale: Locale): Promise<ProposalInbox> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return {
      activityProposals: [],
      evidenceProposals: [],
      backendAvailable: false,
    };
  }

  const params = new URLSearchParams({ locale });

  const [activityProposals, evidenceProposals] = await Promise.all([
    fetchJson<ProposalItem[]>(`/me/activity-proposals?${params.toString()}`, {
      allowFailure: true,
      headers,
    }),
    fetchJson<ProposalItem[]>(`/me/evidence-proposals?${params.toString()}`, {
      allowFailure: true,
      headers,
    }),
  ]);

  return {
    activityProposals: activityProposals ?? [],
    evidenceProposals: evidenceProposals ?? [],
    backendAvailable: Boolean(activityProposals || evidenceProposals),
  };
}

export async function getFollowedActivities(
  locale: Locale,
): Promise<ActivityCard[] | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  return fetchJson<ActivityCard[]>(`/me/followed-activities?locale=${locale}`, {
    headers,
    allowFailure: true,
    allowNotFound: true,
  });
}

export async function getActivityProposalDetail(
  id: string,
): Promise<ActivityProposalDetail | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  return fetchJson<ActivityProposalDetail>(`/me/activity-proposals/${id}`, {
    headers,
    allowNotFound: true,
    allowFailure: true,
  });
}

export async function getEvidenceProposalDetail(
  id: string,
): Promise<EvidenceProposalDetail | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  return fetchJson<EvidenceProposalDetail>(`/me/evidence-proposals/${id}`, {
    headers,
    allowNotFound: true,
    allowFailure: true,
  });
}

export async function getModerationQueue(input: {
  locale: Locale;
  type?: ModerationQueueType;
  status?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<ModerationQueueResponse | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  const params = new URLSearchParams({
    locale: input.locale,
    type: input.type ?? "activity_proposals",
    page: String(input.page ?? 1),
    pageSize: String(input.pageSize ?? 20),
  });

  if (input.status) {
    params.set("status", input.status);
  }

  if (input.q) {
    params.set("q", input.q);
  }

  return fetchJson<ModerationQueueResponse>(`/moderation/queue?${params.toString()}`, {
    headers,
    allowFailure: true,
  });
}

export async function getAdminPublicSettings(): Promise<PublicSettings | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  return fetchJson<PublicSettings>("/admin/public-settings", {
    headers,
    allowFailure: true,
    allowNotFound: true,
  });
}

export async function getContactMessages(input: {
  status?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<ContactMessageListResponse | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  const params = new URLSearchParams({
    page: String(input.page ?? 1),
    pageSize: String(input.pageSize ?? 20),
  });

  if (input.status) params.set("status", input.status);
  if (input.q) params.set("q", input.q);

  return fetchJson<ContactMessageListResponse>(`/contact/messages?${params.toString()}`, {
    headers,
    allowFailure: true,
    allowNotFound: true,
  });
}

export async function getEditorialActivities(input: {
  locale: Locale;
  status?: string;
  q?: string;
  hasEditorialSummary?: string;
  hasEvidence?: string;
  officialAiStatus?: string;
  industry?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<EditorialActivityListResponse | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  const params = new URLSearchParams({
    locale: input.locale,
    page: String(input.page ?? 1),
    pageSize: String(input.pageSize ?? 20),
  });

  if (input.status) {
    params.set("status", input.status);
  }

  if (input.q) params.set("q", input.q);
  if (input.hasEditorialSummary) params.set("hasEditorialSummary", input.hasEditorialSummary);
  if (input.hasEvidence) params.set("hasEvidence", input.hasEvidence);
  if (input.officialAiStatus) params.set("officialAiStatus", input.officialAiStatus);
  if (input.industry) params.set("industry", input.industry);
  if (input.category) params.set("category", input.category);

  return fetchJson<EditorialActivityListResponse>(
    `/editorial/activities?${params.toString()}`,
    {
      headers,
      allowFailure: true,
    },
  );
}

export async function getEditorialActivityDetail(
  id: string,
  locale: Locale,
  status?: string,
): Promise<EditorialActivityDetail | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  return fetchJson<EditorialActivityDetail>(
    `/editorial/activities/${id}?${new URLSearchParams({
      locale,
      ...(status ? { status } : {}),
    }).toString()}`,
    {
      headers,
      allowFailure: true,
      allowNotFound: true,
    },
  );
}

export async function getEditorialCatalogReferences(
  locale: Locale,
): Promise<EditorialCatalogReferences | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  return fetchJson<EditorialCatalogReferences>(
    `/editorial/catalog/references?${new URLSearchParams({ locale }).toString()}`,
    {
      headers,
      allowFailure: true,
    },
  );
}

export async function getEditorialCatalogActivities(input: {
  locale: Locale;
  status?: string;
  q?: string;
  granularity?: string;
  officialAiStatus?: string;
  industry?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<EditorialCatalogActivityListResponse | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  const params = new URLSearchParams({
    locale: input.locale,
    page: String(input.page ?? 1),
    pageSize: String(input.pageSize ?? 20),
  });

  if (input.status) params.set("status", input.status);
  if (input.q) params.set("q", input.q);
  if (input.granularity) params.set("granularity", input.granularity);
  if (input.officialAiStatus) params.set("officialAiStatus", input.officialAiStatus);
  if (input.industry) params.set("industry", input.industry);
  if (input.category) params.set("category", input.category);

  return fetchJson<EditorialCatalogActivityListResponse>(
    `/editorial/catalog/activities?${params.toString()}`,
    {
      headers,
      allowFailure: true,
    },
  );
}

export async function getEditorialCatalogActivityDetail(
  id: string,
  locale: Locale,
): Promise<EditorialCatalogActivityDetail | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  return fetchJson<EditorialCatalogActivityDetail>(
    `/editorial/catalog/activities/${id}?${new URLSearchParams({ locale }).toString()}`,
    {
      headers,
      allowFailure: true,
      allowNotFound: true,
    },
  );
}

export async function getEditorialCatalogEvidence(input: {
  locale: Locale;
  status?: string;
  q?: string;
  type?: string;
  activityId?: string;
  reliabilityFlag?: string;
  page?: number;
  pageSize?: number;
}): Promise<EditorialCatalogEvidenceListResponse | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  const params = new URLSearchParams({
    locale: input.locale,
    page: String(input.page ?? 1),
    pageSize: String(input.pageSize ?? 20),
  });

  if (input.status) params.set("status", input.status);
  if (input.q) params.set("q", input.q);
  if (input.type) params.set("type", input.type);
  if (input.activityId) params.set("activityId", input.activityId);
  if (input.reliabilityFlag) params.set("reliabilityFlag", input.reliabilityFlag);

  return fetchJson<EditorialCatalogEvidenceListResponse>(
    `/editorial/catalog/evidence?${params.toString()}`,
    {
      headers,
      allowFailure: true,
    },
  );
}

export async function getEditorialCatalogEvidenceDetail(
  id: string,
  locale: Locale,
): Promise<EditorialCatalogEvidenceDetail | null> {
  const headers = await getSessionHeaders();

  if (!headers) {
    return null;
  }

  return fetchJson<EditorialCatalogEvidenceDetail>(
    `/editorial/catalog/evidence/${id}?${new URLSearchParams({ locale }).toString()}`,
    {
      headers,
      allowFailure: true,
      allowNotFound: true,
    },
  );
}
