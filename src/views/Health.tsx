export default function Health() {
  // Intentionally minimal: avoid app layout, heavy components, and external embeds.
  // If this renders, the domain is serving HTML + the JS bundle executed.
  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Health check</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If you can read this, the app JS loaded and rendered successfully.
        </p>

        <div className="mt-6 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">Status</span>
            <span className="text-sm font-semibold text-success">OK</span>
          </div>
          <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between gap-4">
              <span>Path</span>
              <span className="font-mono text-foreground">/health</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Rendered at</span>
              <span className="font-mono text-foreground">
                {new Date().toISOString()}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          If your root domain shows a white screen but this page loads, the issue is likely
          route-specific UI/code (not DNS).
        </p>
      </div>
    </main>
  );
}
