import { VerificationFlow } from "./_components/verification-flow";

type VerifyPageProps = {
  searchParams: Promise<{
    verification_id?: string | string[];
    external_user_id?: string | string[];
    callback_url?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const query = await searchParams;
  const verificationId = firstValue(query.verification_id)?.trim();

  if (verificationId) {
    return <VerificationFlow initialVerificationId={verificationId} />;
  }

  return <MissingVerificationNotice />;
}

function MissingVerificationNotice() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
          Secure identity check
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Verify your identity
        </h1>
        <p className="text-muted-foreground">
          Take a selfie and photograph your ID. Most people finish in under two
          minutes.
        </p>
      </header>
      <div className="flex flex-col gap-3 rounded-xl border border-dashed bg-card p-6">
        <h2 className="text-base font-semibold">Verification session required</h2>
        <p className="text-sm text-muted-foreground">
          This page expects a{" "}
          <code className="font-mono text-xs">verification_id</code>{" "}
          query parameter for the session your service created.
        </p>
        <p className="text-xs text-muted-foreground">
          Example:{" "}
          <code className="font-mono">/verify?verification_id={"<uuid>"}</code>{" "}
        </p>
      </div>
    </main>
  );
}
