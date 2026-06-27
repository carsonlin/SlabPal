import { useState, useEffect } from "react"

interface Batch {
  id: string
  user_id: string
  grading_company: string
  status: string
  fees_upfront: string
  fees_after: string | null
  submitted_at: string
  returned_at: string | null
}

function BatchList() {
  const [batches, setBatches] = useState<Batch[]>([])

  useEffect(() => {
    fetch("http://localhost:8000/batches")
      .then(res => res.json())
      .then(data => setBatches(data))
  }, [])

  return (
    <div className="flex flex-col gap-3">
      {batches.map(batch => (
        <div
          key={batch.id}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow flex items-center gap-6 cursor-pointer hover:border-[#e3350d]"
        >
          {/* Company badge */}
          <div className="w-11 h-11 rounded-lg bg-[#e3350d] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {batch.grading_company}
          </div>

          {/* Name + date subtitle — flex-1 pushes the columns to the right */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{batch.id}</div>
            <div className="text-xs text-gray-400">
              {new Date(batch.submitted_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>

          {/* Cards column — placeholder: needs card count from API */}
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Cards</div>
            <div className="text-sm font-semibold">—</div>
          </div>

          {/* Fees column */}
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Fees</div>
            <div className="text-sm font-semibold">${batch.fees_upfront}</div>
          </div>

          {/* Net profit column — placeholder: needs computed profit from API */}
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Net profit</div>
            <div className="text-sm font-semibold">—</div>
          </div>

          {/* Status badge — conditional color */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              batch.status === "complete"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {batch.status}
          </span>
        </div>
      ))}
    </div>
  )
}

export default BatchList