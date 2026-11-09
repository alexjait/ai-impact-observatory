import { ResetPasswordForm } from "@/components/reset-password-form";
import { SiteShell } from "@/components/site-shell";
import { readParam, resolveLocale } from "@/lib/site";

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const token = readParam(params, "token");

  return (
    <SiteShell locale={locale}>
      <ResetPasswordForm locale={locale} initialToken={token} />
    </SiteShell>
  );
}
