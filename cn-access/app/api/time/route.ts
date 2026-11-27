export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const body = {
    ok: true,
    iso: now.toISOString(),
    epochMs: now.getTime(),
    timezone: "UTC",
    server: "cursor-app",
  };

  return Response.json(body, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
