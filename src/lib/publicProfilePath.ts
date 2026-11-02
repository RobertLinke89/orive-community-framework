export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function buildPublicProfilePath(params: { id: string; username?: string | null }): string {
  const username = (params.username ?? "").toString().trim();
  if (username) return `/${encodeURIComponent(username)}`;

  if (isUuid(params.id)) return `/p/${params.id}`;

  // Legacy/internal route for mock/sample data that isn't a UUID.
  return `/facilitator/${params.id}`;
}
