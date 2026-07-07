import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { getClientToken, backendClientFetch } from "@/lib/client-proxy";
import { clientSessionFromToken } from "@/lib/auth-session";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/lib/api-client";
import Link from "next/link";

export default async function DashboardPage() {
  const token = await getClientToken();
  const session = clientSessionFromToken(token);
  if (!session.authenticated) {
    redirect("/login");
  }

  const response = await backendClientFetch("/api/v1/workspaces");
  const workspaces = (await response.json()) as Workspace[];

  if (workspaces.length === 1) {
    redirect(`/dashboard/${workspaces[0].workspace_id}`);
  }

  if (workspaces.length === 0) {
    return (
      <AppShell audience="client">
        <main className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
          <h1 className="text-3xl font-bold tracking-tight">No Workspaces Found</h1>
          <p className="text-muted-foreground">
            You don&apos;t have any workspaces assigned to you. Please contact your organization owner to create one.
          </p>
          <Button render={<Link href="/login" />}>Back to Sign In</Button>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Select a Workspace</h1>
          <p className="text-muted-foreground">Choose the workspace you want to manage.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Card key={ws.workspace_id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{ws.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {ws.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
<Button render={<Link href={`/dashboard/${ws.workspace_id}`} />} className="w-full">
                Enter Workspace
              </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
