import "server-only";

/** Checks the shared-secret header sent by the admin panel's own requests. */
export function isAuthorized(request: Request): boolean {
  const configured = process.env.ADMIN_SECRET;
  if (!configured) return false;
  const provided = request.headers.get("x-admin-secret");
  return provided === configured;
}
