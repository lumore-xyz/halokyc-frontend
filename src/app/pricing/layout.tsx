export default function PricingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-(--landing-paper) text-(--landing-ink)">
      <main className="flex-1">{children}</main>
    </div>
  );
}
