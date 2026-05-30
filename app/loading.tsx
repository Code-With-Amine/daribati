export default function RootLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[oklch(0.14_0.015_260)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-400/20 border-t-indigo-400 animate-spin" />
        <p className="text-sm text-indigo-300/40">Chargement...</p>
      </div>
    </div>
  )
}
