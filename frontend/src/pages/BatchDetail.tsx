import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

interface CardOut {
  id: string
  pokemon_name: string
  set_string: string
  raw_value: string
  target_grade: number
  actual_grade: number | null
  graded_value: string | null
  confidence: number
  front_photo_key: string | null
  back_photo_key: string | null
}

interface BatchDetail {
  id: string
  name: string
  grading_company: string
  status: string
  fees_upfront: string
  fees_after: string | null
  submitted_at: string
  returned_at: string | null
  card_count: number
  net_profit: string
  cards: CardOut[]
}


function fmtDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function BatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [batch, setBatch] = useState<BatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)


  useEffect(() => {
    fetch(`http://localhost:8000/batches/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBatch(data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-20 w-full bg-gray-200 rounded-lg animate-pulse mb-7" />
        <div className="grid grid-cols-[repeat(auto-fill,220px)] gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 w-[220px] bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!batch) {
    return <div className="animate-fade-in text-center py-20 text-gray-400">Batch not found.</div>
  }

  const rawIn = batch.cards.reduce((sum, c) => sum + parseFloat(c.raw_value), 0)
  const gradedOut = batch.cards.reduce(
    (sum, c) => sum + (c.graded_value !== null ? parseFloat(c.graded_value) : 0),
    0
  )
  const fees = parseFloat(batch.fees_upfront) + (batch.fees_after !== null ? parseFloat(batch.fees_after) : 0)
  const netProfit = parseFloat(batch.net_profit)
  const money = (n: number) => `$${Math.abs(n).toLocaleString()}`

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 -mx-9 px-9">
        <div>
          <div className="text-sm text-gray-400">Batches / {batch.name}</div>
          <div className="text-2xl font-bold">{batch.name}</div>
        </div>
        <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#e3350d] text-white hover:bg-[#c62d0b] transition-all cursor-pointer"
        onClick={() => setShowResults(true)}>
          Enter results
        </button>
      </div>

      {showResults && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowResults(false)}   // click backdrop to close
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}   // clicking inside doesn't close
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Enter grading results</h3>
              <button onClick={() => setShowResults(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>

            {/* the form content — inputs for each card's grade */}

          </div>
        </div>
      )}

      {/* Back link + meta */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-[#e3350d] hover:underline mb-2"
        >
          ← Back to batches
        </button>
        <div className="text-sm text-gray-400 flex items-center gap-1 flex-wrap">
          {batch.grading_company}
          {fmtDate(batch.submitted_at) && <> · submitted {fmtDate(batch.submitted_at)}</>}
          {fmtDate(batch.returned_at) && <> · returned {fmtDate(batch.returned_at)}</>}
          <span
            className={`ml-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              batch.status === "complete" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${batch.status === "complete" ? "bg-green-600" : "bg-blue-600"}`} />
            {batch.status === "complete" ? "Complete" : "Grading"}
          </span>
        </div>
      </div>

      {/* Summary strip — 4 cells */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white mb-7">
        <div className="p-4 border-r border-gray-200">
          <div className="text-xs text-gray-400 mb-1.5">Raw value in</div>
          <div className="text-lg font-bold">{money(rawIn)}</div>
        </div>
        <div className="p-4 border-r border-gray-200">
          <div className="text-xs text-gray-400 mb-1.5">Graded value out</div>
          <div className="text-lg font-bold">{money(gradedOut)}</div>
        </div>
        <div className="p-4 border-r border-gray-200">
          <div className="text-xs text-gray-400 mb-1.5">Grading fees</div>
          <div className="text-lg font-bold">{money(fees)}</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-gray-400 mb-1.5">Net batch profit</div>
          <div className={`text-lg font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {netProfit >= 0 ? "+" : "-"}{money(netProfit)}
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
        Cards in this batch · {batch.card_count}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-[repeat(auto-fill,250px)] gap-4">
        {batch.cards.map((card) => {
          const raw = parseFloat(card.raw_value)
          const graded = card.graded_value !== null ? parseFloat(card.graded_value) : null
          const valueAdded = graded !== null ? graded - raw : null
          const gem = card.actual_grade === 10
          return (
            <div
              key={card.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:border-[#e3350d] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              {/* Photo area with grade badge */}
              <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 relative grid place-items-center border-b border-gray-200">
                <span className="text-xs text-gray-400">front photo</span>
                {card.actual_grade !== null && (
                  <div
                    className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-lg grid place-items-center text-white font-bold text-base shadow-md ${
                      gem ? "bg-gradient-to-br from-[#f0b429] to-[#e3350d]" : "bg-[#2a2a32]"
                    }`}
                  >
                    {card.actual_grade}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="font-bold text-sm">{card.pokemon_name}</div>
                <div className="text-xs text-gray-400 mt-0.5 mb-3">{card.set_string}</div>

                <div className="flex justify-between text-sm py-0.5">
                  <span className="text-gray-500">Raw value</span>
                  <span className="font-semibold">${raw.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm py-0.5">
                  <span className="text-gray-500">Graded value</span>
                  <span className="font-semibold">{graded !== null ? `$${graded.toLocaleString()}` : "—"}</span>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Value added</span>
                  {valueAdded !== null ? (
                    <span className={`text-sm font-bold ${valueAdded >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {valueAdded >= 0 ? "+" : "-"}${Math.abs(valueAdded).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Pending</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}