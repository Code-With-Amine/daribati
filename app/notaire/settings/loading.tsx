export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="md:col-span-2 space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
      <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
    </div>
  )
}
