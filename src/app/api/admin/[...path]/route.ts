import { backendFetch } from "@/lib/admin-proxy";

type Params = {
  path: string[];
};

function backendPath(path: string[], request: Request) {
  const suffix = path.map(encodeURIComponent).join("/");
  return `/api/v1/admin/${suffix}${new URL(request.url).search}`;
}

async function proxy(request: Request, context: { params: Promise<Params> }) {
  const { path } = (await context.params) as Params;
  const init: RequestInit = { method: request.method };
  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text();
    if (body) init.body = body;
  }
  return backendFetch(backendPath(path, request), init);
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
