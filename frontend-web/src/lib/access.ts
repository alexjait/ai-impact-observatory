import { type AuthenticatedUser } from "./api";

const MODERATION_ROLES = new Set(["MODERATOR", "ADMIN"]);
const EDITORIAL_ROLES = new Set(["EDITOR", "ADMIN"]);
const ADMIN_ROLES = new Set(["ADMIN"]);

export function canModerate(user: AuthenticatedUser | null): boolean {
  return Boolean(user?.roles.some((role) => MODERATION_ROLES.has(role)));
}

export function canEditEditorial(user: AuthenticatedUser | null): boolean {
  return Boolean(user?.roles.some((role) => EDITORIAL_ROLES.has(role)));
}

export function canAccessBackoffice(user: AuthenticatedUser | null): boolean {
  return canModerate(user) || canEditEditorial(user);
}

export function canAdminister(user: AuthenticatedUser | null): boolean {
  return Boolean(user?.roles.some((role) => ADMIN_ROLES.has(role)));
}
