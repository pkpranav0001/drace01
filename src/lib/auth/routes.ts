export const PUBLIC_AUTH_PATHS = ["/login", "/auth/callback", "/admin/login"] as const;

/** Storefront routes that require a logged-in customer. */
const CUSTOMER_PROTECTED_PREFIXES = ["/checkout", "/orders"] as const;

export function isPublicAuthPath(pathname: string) {
  return PUBLIC_AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isCustomerProtectedPath(pathname: string) {
  if (isAdminPath(pathname)) return false;
  if (isPublicAuthPath(pathname)) return false;

  return CUSTOMER_PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
