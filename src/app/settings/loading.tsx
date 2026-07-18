export default function SettingsLoading() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="animate-pulse">
        <div className="h-9 w-48 bg-muted rounded mb-6" />
        <div className="space-y-6">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}