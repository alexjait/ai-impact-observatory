import type { AuthProvider, RoleKey } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
  roles: RoleKey[];
  sessionId: string;
  authMethods: AuthProvider[];
  hasLocalPassword: boolean;
};
