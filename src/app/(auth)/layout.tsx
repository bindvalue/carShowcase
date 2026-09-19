export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/60 via-background to-muted/30 px-4 py-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}