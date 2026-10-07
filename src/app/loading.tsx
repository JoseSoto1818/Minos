export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
    >
      <div className="space-y-4 text-center">
        <div className="mx-auto size-9 animate-pulse rounded-xl bg-primary/20" />
        <p className="text-sm text-muted-foreground">Preparando tu espacio…</p>
      </div>
    </div>
  );
}
