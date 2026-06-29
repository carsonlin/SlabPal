import { useState, useEffect } from "react"

interface Batch {
  id: string
  user_id: string
  name: string
  grading_company: string
  status: string
  fees_upfront: string
  fees_after: string | null
  submitted_at: string
  returned_at: string | null
  card_count: number
  net_profit: string | null
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
      {batches.map(batch => {
        const profitNum = batch.net_profit !== null ? parseFloat(batch.net_profit) : 0
        const profitColor =
          profitNum > 0 ? "text-green-600"
          : profitNum < 0 ? "text-red-600"
          : ""

        const companyColor =
          batch.grading_company === "PSA" ? "bg-[#c0202d]"   
          : batch.grading_company === "CGC" ? "bg-[#1f6dbf]"    
          : batch.grading_company === "BGS" ? "bg-black" 
          : batch.grading_company === "SGC" ? "bg-gray-700"   
          : batch.grading_company === "TAG" ? "bg-[#2b2c6e]"  
          : "bg-gray-500"

        return (
          <div
            key={batch.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs flex items-center gap-6 cursor-pointer hover:border-[#e3350d]"
          >
            {/* Company badge */}
            <div className={`w-11 h-11 rounded-lg ${companyColor} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
              {batch.grading_company}
            </div>

            {/* Name + date subtitle */}
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{batch.name}</div>
              <div className="text-xs text-gray-400">
                {new Date(batch.submitted_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Cards column */}
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Cards</div>
              <div className="text-sm font-semibold">{batch.card_count}</div>
            </div>

            {/* Fees column */}
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Fees</div>
              <div className="text-sm font-semibold">${batch.fees_upfront}</div>
            </div>

            {/* Net profit column — colored by sign */}
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Net profit</div>
              <div className={`text-sm font-semibold ${profitColor}`}>
                {batch.net_profit !== null
                  ? `${profitNum >= 0 ? "+" : "-"}$${Math.abs(profitNum)}`
                  : "$0"}
              </div>
            </div>

            {/* Status badge — conditional color with dot */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                batch.status === "complete"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                batch.status === "complete" ? "bg-green-600" : "bg-blue-600"
              }`}></span>
              {batch.status === "complete" ? "Complete" : "Grading"}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default BatchList