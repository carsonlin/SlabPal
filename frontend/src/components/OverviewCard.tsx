type Tone = "positive" | "negative" | "neutral"

function OverviewCard({ label, value, accent, subtitle, tone }: {
  label: string
  value: string
  accent: string
  subtitle: string
  tone: Tone
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
      <div className="text-2xl font-bold ${toneclass}">{value}</div>
      <div className={`text-xs mt-2 font-semibold ${toneClass}`}>
        {icon}{subtitle}
      </div>
    </div>
  )
}

export default OverviewCard