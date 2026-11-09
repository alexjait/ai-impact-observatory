import Link from "next/link";

import { FollowToggleButton } from "@/components/follow-toggle-button";
import { type ActivityCard as ActivityCardData } from "@/lib/api";
import {
  type Locale,
  buildPath,
  formatAiStatus,
  formatEditorialStatus,
  formatGranularity,
  localized,
} from "@/lib/site";

type ActivityCardProps = {
  activity: ActivityCardData;
  locale: Locale;
  isAuthenticated?: boolean;
};

export function ActivityCard({
  activity,
  locale,
  isAuthenticated = false,
}: ActivityCardProps) {
  const cardSummary =
    activity.editorialSummary ??
    activity.shortDescription ??
    localized(locale, {
      en: "A short summary is on the way. Taxonomy and classification are already available.",
      es: "La síntesis breve está en camino. La taxonomía y la clasificación ya están disponibles.",
    });

  return (
    <article className="activity-card">
      <div className="activity-card__meta">
        <span className="status-pill">
          {formatAiStatus(activity.officialAiStatus, locale)}
        </span>
        <span className="activity-card__granularity">
          {formatGranularity(activity.granularity, locale)}
        </span>
      </div>

      <div className="activity-card__body">
        <h3>
          {activity.isPubliclyVisible ? (
            <Link href={buildPath(`/activities/${activity.slug}`, locale)}>
              {activity.title}
            </Link>
          ) : (
            activity.title
          )}
        </h3>
        <p>{cardSummary}</p>
        {!activity.isPubliclyVisible ? (
          <p className="activity-card__status-note">
            {localized(locale, {
              en: `Still in your followed list. Current status: ${formatEditorialStatus(
                activity.editorialStatus,
                locale,
              ).toLowerCase()}.`,
              es: `Sigue en tus actividades seguidas. Estado actual: ${formatEditorialStatus(
                activity.editorialStatus,
                locale,
              ).toLowerCase()}.`,
            })}
          </p>
        ) : null}
      </div>

      <div className="activity-card__tags">
        {activity.industries.slice(0, 2).map((industry) => (
          <span key={industry} className="tag-chip">
            {industry}
          </span>
        ))}
        {activity.categories.slice(0, 2).map((category) => (
          <span key={category} className="tag-chip tag-chip--muted">
            {category}
          </span>
        ))}
        {!activity.isPubliclyVisible ? (
          <span className="tag-chip tag-chip--muted">
            {localized(locale, {
              en: "No longer public",
              es: "Ya no es pública",
            })}
          </span>
        ) : null}
      </div>

      {isAuthenticated ? (
        <div className="activity-card__actions">
          <FollowToggleButton
            activityId={activity.id}
            locale={locale}
            initialIsFollowing={activity.isFollowing}
            compact
          />
        </div>
      ) : null}
    </article>
  );
}
