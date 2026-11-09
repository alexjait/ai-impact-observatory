import { SiteShell } from "@/components/site-shell";
import { SocialSignupForm } from "@/components/social-signup-form";
import { readParam, resolveLocale } from "@/lib/site";

type SocialCompletePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SocialCompletePage({
  searchParams,
}: SocialCompletePageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));

  return (
    <SiteShell locale={locale}>
      <SocialSignupForm locale={locale} />
    </SiteShell>
  );
}
