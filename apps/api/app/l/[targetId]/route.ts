import { resolveLink } from "@awfixersites/links";
import { track } from "@awfixersites/telemetry/track";

type RouteContext = {
  params: Promise<{ targetId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { targetId } = await context.params;
  const url = new URL(request.url);

  try {
    const resolved = resolveLink(decodeURIComponent(targetId), {
      referer: request.headers.get("referer"),
      site: url.searchParams.get("site"),
      utmSource: url.searchParams.get("utm_source"),
      utmMedium: url.searchParams.get("utm_medium"),
    });

    track("link_redirect", {
      targetId,
      internal: resolved.internal,
      destination: resolved.url,
      referer: request.headers.get("referer"),
      site: url.searchParams.get("site"),
    });

    const headers = new Headers({
      Location: resolved.url,
      "Cache-Control": resolved.internal
        ? "public, s-maxage=300, stale-while-revalidate=600"
        : "public, s-maxage=3600, stale-while-revalidate=86400",
    });

    return new Response(null, { status: 302, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Link not found";
    const status = message.includes("Unknown link target") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}