type AccessTokenPayload = {
  permissionKeys?: string[];
};

const base64UrlDecode = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(normalized + pad);
};

export const extractPermissionKeys = (token: string): string[] => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return [];
    const payload = JSON.parse(base64UrlDecode(parts[1])) as AccessTokenPayload;
    return Array.isArray(payload.permissionKeys) ? payload.permissionKeys : [];
  } catch {
    return [];
  }
};
