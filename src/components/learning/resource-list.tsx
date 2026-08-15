function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function ResourceList({
  resources,
}: {
  resources: Array<{
    id: string;
    title: string;
    url: string;
    kind: string;
    provider?: string | null;
    snippet?: string | null;
  }>;
}) {
  if (!resources.length) {
    return (
      <p className="text-sm text-muted">
        No external links for this module — the lesson above should stand on its
        own.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {resources.map((r) => {
        const host = hostnameOf(r.url);
        return (
          <li key={r.id}>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted-bg text-[10px] font-semibold uppercase text-muted"
                  aria-hidden
                >
                  {host ? host.slice(0, 2) : "·"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {r.title}
                    <span className="ml-1 text-xs font-normal text-muted">
                      ↗
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    {r.kind}
                    {r.provider ? ` · ${r.provider}` : ""}
                    {host ? ` · ${host}` : ""}
                  </p>
                  {r.snippet ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {r.snippet}
                    </p>
                  ) : null}
                </div>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
