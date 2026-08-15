export default function PathLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:py-10">
      <div className="h-4 w-48 animate-pulse rounded bg-muted-bg" />
      <div className="h-10 w-2/3 animate-pulse rounded-md bg-muted-bg" />
      <div className="h-2 w-full animate-pulse rounded-full bg-muted-bg" />
      <div className="space-y-3">
        <div className="h-28 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-28 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-28 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}
