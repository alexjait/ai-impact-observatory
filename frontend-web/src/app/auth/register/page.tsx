import { RegisterForm } from "@/components/register-form";
import { SiteShell } from "@/components/site-shell";
import { getProviders } from "@/lib/api";
import { readParam, resolveLocale } from "@/lib/site";

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(readParam(params, "locale"));
  const returnTo = readParam(params, "returnTo");
  const providers = await getProviders();

  return (
    <SiteShell locale={locale}>
      <RegisterForm locale={locale} providers={providers} returnTo={returnTo} />
    </SiteShell>
  );
}
