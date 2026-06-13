export default function DashboardLoading() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading intelligence…</p>
      </div>
    </div>
  )
}
