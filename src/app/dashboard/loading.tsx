export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-10">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted-bg" />
      <div className="h-48 animate-pulse rounded-2xl border border-border bg-card" />
      <div className="space-y-2">
        <div className="h-16 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-16 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}
