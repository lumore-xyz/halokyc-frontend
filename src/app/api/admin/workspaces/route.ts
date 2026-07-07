import { backendFetch } from "@/lib/admin-proxy";

export async function GET() {
  return backendFetch("/api/v1/admin/workspaces");
}