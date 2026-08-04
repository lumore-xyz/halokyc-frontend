import { AppShell } from "@/components/dashboard/app-shell";
import { VerificationChecklist } from "./_components/verification-checklist";

export default function VerificationPage() {
  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
        <header className="max-w-2xl space-y-3">
          <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
            Account trust
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Complete your verification
          </h1>
          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            Finish these two checks to manage sensitive organization and
            workspace actions.
          </p>
        </header>
        <VerificationChecklist />
      </main>
    </AppShell>
  );
}
