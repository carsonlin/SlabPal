type Tone = "positive" | "negative" | "neutral"

export default function OverviewCard({ label, value, accent, subtitle, tone, colorValue, loading }: {
  label: string
  value: string
  accent: string
  subtitle: string
  tone: Tone
  colorValue?: boolean
  loading?: boolean        // ← new: show skeleton while loading
}) {
  const toneClass =
    tone === "positive" ? "text-green-600"
    : tone === "negative" ? "text-red-600"
    : "text-gray-400"

  const icon = tone === "positive" ? "▲ " : tone === "negative" ? "▼ " : ""

  return (
    <div className="bg-white p-4 px-6 rounded-lg shadow-lg relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`}></div>
      <div className="text-xs text-gray-500 font-medium mb-2">{label}</div>

      {loading ? (
        <>
          {/* skeleton bars instead of value + subtitle */}
          <div className="h-8 w-28 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mt-3"></div>
        </>
      ) : (
        <>
          <div className={`text-3xl font-bold ${colorValue ? toneClass : ""}`}>{value}</div>
          <div className={`text-sm mt-2 font-semibold ${toneClass}`}>
            {icon}{subtitle}
          </div>
        </>
      )}
    </div>
  )
}