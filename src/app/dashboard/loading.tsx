export default function DashboardLoading() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="animate-pulse">
        <div className="h-9 w-48 bg-muted rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="h-64 bg-muted rounded-xl" />
          </div>
          <div className="md:col-span-3 space-y-6">
            <div className="h-12 bg-muted rounded-lg w-72" />
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}