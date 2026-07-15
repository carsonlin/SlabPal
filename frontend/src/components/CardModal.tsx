import type { CardOut } from "../types"

interface CardModalProps {
  card: CardOut
  onClose: () => void
}

export default function CardModal({ card, onClose }: CardModalProps) {
  const raw = parseFloat(card.raw_value)
  const graded = card.graded_value !== null ? parseFloat(card.graded_value) : null
  const valueAdded = graded !== null ? graded - raw : null
  const beat = card.actual_grade !== null && card.actual_grade >= card.target_grade

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo area — front + back side by side */}
        <div className="grid grid-cols-2 gap-px bg-gray-200">
        {/* Front */}
        <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 grid place-items-center">
            {card.front_photo_key ? (
            <img
                src={/* front photo URL — wired once S3 is set up */ ""}
                alt={`${card.pokemon_name} front`}
                className="w-full h-full object-contain"
            />
            ) : (
            <span className="text-xs text-gray-400">front photo</span>
            )}
        </div>

        {/* Back */}
        <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 grid place-items-center">
            {card.back_photo_key ? (
            <img
                src={/* back photo URL — wired once S3 is set up */ ""}
                alt={`${card.pokemon_name} back`}
                className="w-full h-full object-contain"
            />
            ) : (
            <span className="text-xs text-gray-400">back photo</span>
            )}
        </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-xl font-bold">{card.pokemon_name}</div>
          <div className="text-sm text-gray-400 mb-4">{card.set_string}</div>

          {/* Grade row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wide text-[#8a8a95] mb-1">Target</span>
              <span className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold grid place-items-center">
                {card.target_grade}
              </span>
            </div>
            <span className="text-gray-300 mt-4">→</span>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wide text-[#8a8a95] mb-1">Got</span>
              <span
                className={`w-10 h-10 rounded-lg font-bold grid place-items-center text-white ${
                  card.actual_grade === null ? "bg-gray-300" : beat ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {card.actual_grade ?? "—"}
              </span>
            </div>
            <div className="flex flex-col items-center ml-auto">
              <span className="text-[10px] uppercase tracking-wide text-[#8a8a95] mb-1">Confidence</span>
              <span className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold grid place-items-center">
                {card.confidence}
              </span>
            </div>
          </div>

          {/* Values */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-500">Raw value</span>
              <span className="font-semibold">${raw.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-500">Graded value</span>
              <span className="font-semibold">
                {graded !== null ? `$${graded.toLocaleString()}` : "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-500">Value added</span>
              {valueAdded !== null ? (
                <span className={`font-bold ${valueAdded >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {valueAdded >= 0 ? "+" : "-"}${Math.abs(valueAdded).toLocaleString()}
                </span>
              ) : (
                <span className="text-gray-400">Pending</span>
              )}
            </div>
          </div>

          {/* Issues */}
          <div className="border-t border-gray-100 pt-3 mt-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#8a8a95] mb-2">
              Issues noted
            </div>
            {card.issue_types.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {card.issue_types.map((issue) => (
                  <span
                    key={issue.id}
                    className="text-xs bg-gray-100 border border-gray-200 text-gray-600 px-2 py-1 rounded"
                  >
                    {issue.label}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">No issues noted</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}