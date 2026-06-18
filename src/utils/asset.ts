/**
 * Build a URL for a file in the `public/` directory that respects Vite's
 * configured base path.
 *
 * On GitHub Project Pages the app is served from `https://<user>.github.io/<repo>/`,
 * so `import.meta.env.BASE_URL` is `/<repo>/` rather than `/`. Hardcoded paths
 * like `/images/foo.png` would 404 there. Use `asset("images/foo.png")` instead.
 *
 * In dev and in tests BASE_URL is `/`, so the result is identical to the old
 * absolute paths (e.g. `/images/foo.png`).
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL; // always ends with "/"
  return base + path.replace(/^\//, "");
}
