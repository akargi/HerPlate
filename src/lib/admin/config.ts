/**
 * Admin configuration.
 *
 * Set these in production (e.g. .env.local or hosting dashboard):
 *   ADMIN_EMAIL / ADMIN_USERNAME — login identifier
 *   ADMIN_PASSWORD               — login password
 *   ADMIN_SESSION_SECRET         — random string used to sign the session cookie
 *
 * The defaults exist only so local development works out of the box.
 */
export const adminConfig = {
  username: process.env.ADMIN_EMAIL ?? "admin@hptf.org",
  password: process.env.ADMIN_PASSWORD ?? "hptf-admin",
  sessionSecret:
    process.env.ADMIN_SESSION_SECRET ?? "dev-only-secret-change-me",
  cookieName: "hptf_admin_session",
  /** 7 days, in seconds */
  sessionMaxAge: 60 * 60 * 24 * 7,
};

export function usingDefaultCredentials(): boolean {
  return (
    !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "hptf-admin"
  );
}
