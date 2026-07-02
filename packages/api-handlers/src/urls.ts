export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "https://api.awfixer.me"
  );
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}