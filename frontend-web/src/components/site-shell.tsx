import Image from "next/image";
import Link from "next/link";

import { MobileMenu } from "@/components/mobile-menu";
import { canAccessBackoffice } from "@/lib/access";
import { getSessionUser } from "@/lib/api";
import { type Locale, buildPath, localized } from "@/lib/site";

type SiteShellProps = {
  locale: Locale;
  children: React.ReactNode;
  wide?: boolean;
};

export async function SiteShell({ locale, children, wide = false }: SiteShellProps) {
  const user = await getSessionUser();

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link href={buildPath("/", locale)} className="brand-mark">
            <span className="brand-mark__crest" aria-hidden="true">
              <Image
                src="/brand/aiio-mark.svg"
                alt=""
                className="brand-mark__icon"
                width={80}
                height={80}
              />
            </span>
            <span className="brand-mark__copy">
              <span className="brand-mark__eyebrow">
                {localized(locale, {
                  en: "AI Impact Observatory",
                  es: "Observatorio de Impacto IA",
                })}
              </span>
              <span className="brand-mark__title">
                {localized(locale, {
                  en: "Human activities, evidence, and signals of change.",
                  es: "Actividades humanas, evidencia y se\u00f1ales de cambio.",
                })}
              </span>
            </span>
          </Link>

          <nav className="site-nav" aria-label="Primary">
            <Link href={buildPath("/activities", locale)}>
              {localized(locale, { en: "Explore", es: "Explorar" })}
            </Link>
            <Link href={buildPath("/methodology", locale)}>
              {localized(locale, { en: "Methodology", es: "Metodolog\u00eda" })}
            </Link>
            <Link
              href={buildPath("/activities", locale, {
                preset: "high-disruption",
                aiStatus: "4",
              })}
            >
              {localized(locale, { en: "High disruption", es: "Mayor disrupci\u00f3n" })}
            </Link>
          </nav>

          <div className="site-header__actions">
            <div className="locale-switch">
              <Link href={buildPath("/", "en")}>EN</Link>
              <Link href={buildPath("/", "es")}>ES</Link>
            </div>
            {user ? (
              <div className="auth-links">
                {canAccessBackoffice(user) ? (
                  <Link href={buildPath("/backoffice", locale)} className="button button--ghost">
                    {localized(locale, { en: "Backoffice", es: "Backoffice" })}
                  </Link>
                ) : null}
                <Link href={buildPath("/me", locale)} className="button button--ghost">
                  {user.displayName}
                </Link>
              </div>
            ) : (
              <div className="auth-links">
                <Link href={buildPath("/auth/login", locale)} className="button button--ghost">
                  {localized(locale, { en: "Log in", es: "Ingresar" })}
                </Link>
                <Link href={buildPath("/auth/register", locale)} className="button button--solid">
                  {localized(locale, { en: "Register", es: "Crear cuenta" })}
                </Link>
              </div>
            )}
            <MobileMenu locale={locale} user={user} />
          </div>
        </div>
      </header>

      <main className={wide ? "site-main site-main--wide" : "site-main"}>{children}</main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__legal">
            <p className="site-footer__copy">
              {localized(locale, {
                en: "\u00a9 2026 AI Impact Observatory. All rights reserved.",
                es: "\u00a9 2026 Observatorio de Impacto IA. Todos los derechos reservados.",
              })}
            </p>
          </div>
          <nav className="site-footer__nav" aria-label="Footer">
            <Link className="site-footer__link" href={buildPath("/terms", locale)}>
              {localized(locale, { en: "Terms and Conditions", es: "T\u00e9rminos y Condiciones" })}
            </Link>
            <Link className="site-footer__link" href={buildPath("/privacy", locale)}>
              {localized(locale, { en: "Privacy Policy", es: "Pol\u00edtica de Privacidad" })}
            </Link>
            <Link className="site-footer__link" href={buildPath("/contact", locale)}>
              {localized(locale, { en: "Contact", es: "Contacto" })}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
