export async function handleCleanup(): Promise<Response> {
  return Response.json({ ok: true, cleaned: 0 });
}