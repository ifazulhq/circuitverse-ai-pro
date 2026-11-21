export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Welcome Section */}
      <div className="h-10 w-3/4 max-w-md rounded-lg bg-gray-800 sm:h-12" />

      <div className="mt-3 h-5 w-full max-w-2xl rounded bg-gray-800" />

      {/* Current Plan */}
      <div className="mt-6 rounded-lg border border-gray-700 bg-gray-900 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-gray-800" />
            <div className="h-8 w-20 rounded bg-gray-800" />
          </div>

          <div className="h-10 w-32 rounded-lg bg-gray-800" />
        </div>
      </div>

      {/* Usage & Limits */}
      <div className="mt-6 rounded-lg border border-gray-700 bg-gray-900 p-5">
        <div className="h-6 w-36 rounded bg-gray-800" />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-w-0 rounded-lg border border-gray-800 bg-gray-950 p-4"
            >
              <div className="h-4 w-24 rounded bg-gray-800" />
              <div className="mt-2 h-7 w-20 rounded bg-gray-800" />
              <div className="mt-2 h-4 w-28 rounded bg-gray-800" />

              {index === 0 && (
                <div className="mt-3 h-2 w-full rounded-full bg-gray-800" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mt-8 h-10 w-full max-w-md rounded-lg border border-gray-700 bg-gray-900" />

      {/* Statistics */}
      <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-lg border border-gray-800 bg-gray-900"
          />
        ))}
      </div>

      {/* Recent Projects */}
      <div className="mt-6 rounded-lg border border-gray-700 bg-gray-900 p-5">
        <div className="h-6 w-40 rounded bg-gray-800" />
        <div className="mt-2 h-4 w-72 max-w-full rounded bg-gray-800" />

        <div className="mt-5 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 rounded-lg border border-gray-800 bg-gray-950"
            />
          ))}
        </div>
      </div>
    </div>
  );
}