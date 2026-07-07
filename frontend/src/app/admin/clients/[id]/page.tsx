import { AppShell } from "@/components/dashboard/app-shell";
import { AdminClientDetail } from "../../_components/admin-client-detail";

export default async function AdminClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell audience="admin">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <AdminClientDetail clientId={id} />
      </main>
    </AppShell>
  );
}
