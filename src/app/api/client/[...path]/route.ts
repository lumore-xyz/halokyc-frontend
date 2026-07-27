import { backendClientFetch } from "@/lib/client-proxy";

type Params = {
  path: string[];
};

const CLIENT_PREFIX: Record<string, string> = {
  billing: "/api/v1/billing",
  me: "/api/v1/me",
  organizations: "/api/v1/organizations",
  workspaces: "/api/v1/workspaces",
};

function backendPath(path: string[], request: Request) {
  const [first, ...rest] = path;
  const prefix = first ? CLIENT_PREFIX[first] : undefined;
  if (!prefix) return null;
  const suffix = rest.map(encodeURIComponent).join("/");
  return `${prefix}${suffix ? `/${suffix}` : ""}${new URL(request.url).search}`;
}

async function proxy(request: Request, context: { params: Promise<Params> }) {
  const { path } = (await context.params) as Params;
  const target = backendPath(path, request);
  if (!target) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const init: RequestInit = { method: request.method };
  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text();
    if (body) init.body = body;
  }
  return backendClientFetch(target, init);
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
