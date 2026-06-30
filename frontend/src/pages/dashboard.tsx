import OverviewCard from "../components/OverviewCard"
import BatchList from "../components/BatchList"
import { useState, useEffect } from "react"

interface HighestProfitCard {
  pokemon_name: string
  profit: number
}

interface SummaryOut {
  net_grading_profit: number
  cards_graded: number
  total_batches: number
  grade_hit_rate: number
  highest_profit_card: HighestProfitCard | null
}

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryOut>({
    net_grading_profit: 0,
    cards_graded: 0,
    total_batches: 0,
    grade_hit_rate: 0,
    highest_profit_card: null,
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("all")

  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:8000/analytics/summary?period=${period}`)
      .then(res => res.json())
      .then(data => {
        setSummary(data)
        setLoading(false)
      })
  }, [period])

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 -mx-9 px-9">
        <div>
          <div className="text-sm text-gray-400">Overview</div>
          <div className="text-2xl font-bold">Welcome back, Alex</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setPeriod("all")}
              className={`px-3 py-1.5 text-sm whitespace-nowrap ${
                period === "all" ? "bg-[#e3350d] text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All time
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`px-3 py-1.5 text-sm whitespace-nowrap ${
                period === "year" ? "bg-[#e3350d] text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              This year
            </button>
            <button
              onClick={() => setPeriod("90d")}
              className={`px-3 py-1.5 text-sm whitespace-nowrap ${
                period === "90d" ? "bg-[#e3350d] text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              90 days
            </button>
          </div>
          <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm cursor-pointer">
            AL
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <OverviewCard
          label="Net grading profit"
          value={`${summary.net_grading_profit >= 0 ? "+" : "-"}$${Math.abs(summary.net_grading_profit)}`}
          accent="bg-red-600"
          subtitle={summary.net_grading_profit >= 0 ? "value added, after fees" : "value lost, after fees"}
          tone={summary.net_grading_profit >= 0 ? "positive" : "negative"}
          colorValue={true}
          loading={loading}
        />
        <OverviewCard
          label="Cards graded"
          value={String(summary.cards_graded)}
          accent="bg-yellow-400"
          subtitle={"across " + String(summary.total_batches) + " batches"}
          tone="neutral"
          loading={loading}
        />
        <OverviewCard
          label="Grade hit rate"
          value={String(summary.grade_hit_rate) + "%"}
          accent="bg-green-500"
          subtitle={period === "all"? "from all submissions" : period == "year"? "in the past year" : "in the past 90 days"}
          tone="neutral"
          loading={loading}
        />
        <OverviewCard
          label="Your Grail Card"
          value={summary.highest_profit_card?.pokemon_name ?? "---"}
          accent="bg-blue-500"
          subtitle={
            summary.highest_profit_card
              ? `$${summary.highest_profit_card.profit}`
              : "Make your first profits with our app!"
          }
          tone={summary.highest_profit_card ? "positive" : "neutral"}
          loading={loading}
        />
      </div>

      {/* Recent batches */}
      <div>
        <h2 className="text-xs text-gray-500 font-bold mb-4">RECENT BATCHES</h2>
        <BatchList limit={6} />
      </div>
    </div>
  )
}