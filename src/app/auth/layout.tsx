export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950"></div>
      <div className="relative z-10 w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 p-8 shadow-2xl ring-1 ring-white/10">
        {children}
      </div>
    </div>
  );
}
