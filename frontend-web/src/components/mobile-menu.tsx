"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { canAccessBackoffice } from "@/lib/access";
import { type AuthenticatedUser } from "@/lib/api";
import { type Locale, buildPath, localized } from "@/lib/site";

type MobileMenuProps = {
  locale: Locale;
  user: AuthenticatedUser | null;
};

export function MobileMenu({ locale, user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handlePointer(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const openLabel = localized(locale, { en: "Open menu", es: "Abrir menú" });
  const closeLabel = localized(locale, { en: "Close menu", es: "Cerrar menú" });

  return (
    <div className="mobile-menu-root" ref={rootRef}>
      {/* Hamburger trigger */}
      <button
        className="mobile-menu-trigger"
        aria-label={isOpen ? closeLabel : openLabel}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className={`hamburger${isOpen ? " hamburger--open" : ""}`}>
          <span className="hamburger__bar" />
          <span className="hamburger__bar" />
          <span className="hamburger__bar" />
        </span>
      </button>

      {/* Dropdown panel */}
      <nav
        id="mobile-nav-panel"
        className={`mobile-nav-panel${isOpen ? " mobile-nav-panel--open" : ""}`}
        aria-label={localized(locale, {
          en: "Mobile navigation",
          es: "Navegación móvil",
        })}
        aria-hidden={!isOpen}
      >
        {/* Primary nav links */}
        <div className="mobile-nav__section">
          <Link
            href={buildPath("/activities", locale)}
            className="mobile-nav__link"
            onClick={close}
          >
            {localized(locale, { en: "Explore", es: "Explorar" })}
          </Link>
          <Link
            href={buildPath("/methodology", locale)}
            className="mobile-nav__link"
            onClick={close}
          >
            {localized(locale, { en: "Methodology", es: "Metodología" })}
          </Link>
          <Link
            href={buildPath("/activities", locale, {
              preset: "high-disruption",
              aiStatus: "4",
            })}
            className="mobile-nav__link"
            onClick={close}
          >
            {localized(locale, {
              en: "High disruption",
              es: "Mayor disrupción",
            })}
          </Link>
        </div>

        <div className="mobile-nav__divider" />

        {/* Auth section */}
        <div className="mobile-nav__section mobile-nav__section--auth">
          {user ? (
            <>
              {canAccessBackoffice(user) && (
                <Link
                  href={buildPath("/backoffice", locale)}
                  className="button button--ghost"
                  onClick={close}
                >
                  {localized(locale, { en: "Backoffice", es: "Backoffice" })}
                </Link>
              )}
              <Link
                href={buildPath("/me", locale)}
                className="button button--ghost"
                onClick={close}
              >
                {user.displayName}
              </Link>
            </>
          ) : (
            <>
              <Link
                href={buildPath("/auth/login", locale)}
                className="button button--ghost"
                onClick={close}
              >
                {localized(locale, { en: "Log in", es: "Ingresar" })}
              </Link>
              <Link
                href={buildPath("/auth/register", locale)}
                className="button button--solid"
                onClick={close}
              >
                {localized(locale, { en: "Register", es: "Crear cuenta" })}
              </Link>
            </>
          )}
        </div>

        <div className="mobile-nav__divider" />

        {/* Locale switch */}
        <div className="mobile-nav__section mobile-nav__section--locale">
          <Link href={buildPath("/", "en")} onClick={close}>
            EN
          </Link>
          <Link href={buildPath("/", "es")} onClick={close}>
            ES
          </Link>
        </div>
      </nav>
    </div>
  );
}
