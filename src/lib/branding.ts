export function isAppHostname(hostname: string): boolean {
  // Matches production app subdomain, and also supports any future app.* domains.
  return hostname === "app.orive.app" || hostname.startsWith("app.");
}

export function getBrandLabel(hostname: string): {
  uiLabel: string;
  titleLabel: string;
} {
  const isApp = isAppHostname(hostname);

  return {
    uiLabel: isApp ? "ORIVE App" : "ORIVE",
    titleLabel: isApp ? "Orive App" : "Orive",
  };
}

export function formatPageTitle(pageTitle: string | null | undefined, hostname: string): string {
  const { titleLabel } = getBrandLabel(hostname);
  if (!pageTitle) return titleLabel;
  return `${pageTitle} | ${titleLabel}`;
}

export function setPageTitle(pageTitle: string | null | undefined): void {
  // Keep this tiny + synchronous so it's safe to call inside effects.
  const formatted = formatPageTitle(pageTitle, window.location.hostname);
  document.title = formatted;

  // Keep social title tags roughly in sync (best-effort).
  const og = document.querySelector('meta[property="og:title"]');
  if (og) og.setAttribute("content", formatted);
  const tw = document.querySelector('meta[name="twitter:title"]');
  if (tw) tw.setAttribute("content", formatted);
}

export function setMetaDescription(description: string | null | undefined): void {
  const content = (description ?? "").trim();
  if (!content) return;

  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", content);

  // Keep social tags roughly in sync (best-effort).
  const og = document.querySelector('meta[property="og:description"]');
  if (og) og.setAttribute("content", content);
  const tw = document.querySelector('meta[name="twitter:description"]');
  if (tw) tw.setAttribute("content", content);
}
