import { AppShell } from "@/components/dashboard/app-shell";

import { AdminReviewDetail } from "./review-detail";

type AdminReviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminReviewPage({ params }: AdminReviewPageProps) {
  const { id } = await params;
  return (
    <AppShell audience="admin">
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <AdminReviewDetail verificationId={id} />
      </main>
    </AppShell>
  );
}

