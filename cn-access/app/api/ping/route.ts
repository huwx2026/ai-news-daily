export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const started = Date.now();
  const url = new URL(request.url);

  const body = {
    ok: true,
    message: "pong",
    receivedAt: new Date().toISOString(),
    latencyHintMs: Date.now() - started,
    path: url.pathname,
    method: "GET",
  };

  return Response.json(body, {
    headers: {
      "cache-control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const started = Date.now();
  let payload: unknown = null;

  try {
    const text = await request.text();
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { parseError: true };
  }

  const body = {
    ok: true,
    message: "pong",
    receivedAt: new Date().toISOString(),
    latencyHintMs: Date.now() - started,
    echo: payload,
    method: "POST",
  };

  return Response.json(body, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
