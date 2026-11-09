import { LoginForm } from "@/components/login-form";
import { SiteShell } from "@/components/site-shell";
import { getProviders } from "@/lib/api";
import { readParam, resolveLocale } from "@/lib/site";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const returnTo = readParam(params, "returnTo");
  const emailVerification = readParam(params, "emailVerification");
  const providers = await getProviders();

  return (
    <SiteShell locale={locale}>
      <LoginForm
        locale={locale}
        providers={providers}
        returnTo={returnTo}
        emailVerification={emailVerification}
      />
    </SiteShell>
  );
}
