export type SystemRole = "USER" | "SYSTEM_ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
  systemRole: SystemRole;
};

export type LoginPayload = {
  tenantSlug: string;
  email: string;
  password: string;
};

export type RegisterPayload = {
  tenantName: string;
  tenantSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type RegisterResponse = {
  tenant: { id: string; name: string; slug: string };
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};
