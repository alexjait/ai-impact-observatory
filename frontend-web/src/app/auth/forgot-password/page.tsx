import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { SiteShell } from "@/components/site-shell";
import { readParam, resolveLocale } from "@/lib/site";

type ForgotPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));

  return (
    <SiteShell locale={locale}>
      <ForgotPasswordForm locale={locale} />
    </SiteShell>
  );
}
