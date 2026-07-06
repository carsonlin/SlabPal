import { useState, useEffect } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell,
  LineChart, Line, ResponsiveContainer,
} from "recharts"

interface CalibrationPoint {
  confidence: number
  hit_rate: number
  category: string
}

interface ProfitPoint {
  month: string
  profit: number
}

interface IssueOutcome {
  issue_name: string
  flag_count: number
  avg_grade: number | null
  hit_rate: number
}

function categoryColor(category: string) {
  if (category === "under") return "#179b47"
  if (category === "over") return "#d82c2c"
  return "#1a5da5"
}

// color the accuracy bar by hit rate (matches mockup: green/blue/red)
function barColor(hitRate: number) {
  if (hitRate >= 65) return "#179b47"
  if (hitRate >= 50) return "#1a5da5"
  return "#d82c2c"
}

function buildInsights(points: CalibrationPoint[], issues: IssueOutcome[]) {
  const insights: { type: "good" | "warn" | "neutral"; title: string; body: string }[] = []
  if (points.length === 0 && issues.length === 0) return insights

  // --- Calibration-based insights ---
  if (points.length > 0) {
    const best = [...points].sort((a, b) => b.hit_rate - a.hit_rate)[0]
    insights.push({
      type: "good",
      title: `Confidence ${best.confidence} is your strongest read`,
      body: `At confidence ${best.confidence} you hit your target ${best.hit_rate}% of the time — your most reliable zone.`,
    })

    const over = points.filter(p => p.category === "over").sort((a, b) => b.confidence - a.confidence)[0]
    if (over) {
      insights.push({
        type: "warn",
        title: `You're overconfident at ${over.confidence}`,
        body: `Your confidence-${over.confidence} calls only landed ${over.hit_rate}% of the time — lower than the confidence implies.`,
      })
    }

    const under = points.filter(p => p.category === "under").sort((a, b) => a.confidence - b.confidence)[0]
    if (under) {
      insights.push({
        type: "neutral",
        title: `You sell yourself short at ${under.confidence}`,
        body: `Cards you rated confidence ${under.confidence} actually hit ${under.hit_rate}% of the time — better than you predicted.`,
      })
    }
  }

  // --- Issue-based insights ---
  if (issues.length > 0) {
    const sortedByHit = [...issues].filter((issue) => issue.hit_rate !== null).sort((a, b) => b.hit_rate - a.hit_rate)
    const strongestIssue = sortedByHit[0]
    const weakestIssue = sortedByHit[sortedByHit.length - 1]

    insights.push({
      type: "good",
      title: `${strongestIssue.issue_name} is your strong read`,
      body: `Cards you flagged for ${strongestIssue.issue_name.toLowerCase()} still hit target ${strongestIssue.hit_rate}% of the time — you read that flaw well.`,
    })

    if (weakestIssue.issue_name !== strongestIssue.issue_name) {
      insights.push({
        type: "warn",
        title: `${weakestIssue.issue_name} is your weak read`,
        body: `When you flagged ${weakestIssue.issue_name.toLowerCase()}, cards only hit target ${weakestIssue.hit_rate}% of the time — that flaw hurts more than you expect.`,
      })
    }
  }

  return insights
}

const insightStyles = {
  good: { bg: "bg-green-50", icon: "✓", iconBg: "bg-green-600" },
  warn: { bg: "bg-red-50", icon: "!", iconBg: "bg-[#d82c2c]" },
  neutral: { bg: "bg-blue-50", icon: "i", iconBg: "bg-[#1a5da5]" },
}

export default function Analytics() {
  const [points, setPoints] = useState<CalibrationPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [profit, setProfit] = useState<ProfitPoint[]>([])
  const [profitLoading, setProfitLoading] = useState(true)
  const [issues, setIssues] = useState<IssueOutcome[]>([])
  const [issuesLoading, setIssuesLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:8000/analytics/calibration")
      .then(res => res.json())
      .then(data => {
        setPoints(data)
        setLoading(false)
      })
    fetch("http://localhost:8000/analytics/profit-over-time")
      .then(res => res.json())
      .then(data => {
        setProfit(data)
        setProfitLoading(false)
      })
    fetch("http://localhost:8000/analytics/issue-outcomes")
      .then(res => res.json())
      .then(data => {
        setIssues(data)
        setIssuesLoading(false)
      })
  }, [])

  const insights = buildInsights(points, issues)

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 -mx-9 px-9">
        <div>
          <div className="text-sm text-gray-400">Insights</div>
          <div className="text-2xl font-bold">Your grading accuracy</div>
        </div>
      </div>

      {/* Four boxes in a 2-column grid — each row's pair stretches to equal height */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Row 1, Box 1: Calibration chart */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col">
          <h3 className="text-base font-bold mb-1">Confidence calibration</h3>
          <p className="text-sm text-gray-500 mb-5">
            When you said you felt this confident, how often did the card actually
            hit your target grade?
          </p>

          {loading ? (
            <div className="h-72 w-full bg-gray-100 rounded animate-pulse" />
          ) : points.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
              No graded cards yet — your calibration will appear here once cards come back.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={points} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="confidence"
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  label={{ value: "Confidence level", position: "insideBottom", offset: -5, fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: "Hit rate", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#9ca3af", fontSize: 12 } }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  formatter={(value) => [`${value}% hit rate`, "Actual"]}
                  labelFormatter={(label) => `Confidence ${label}`}
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <ReferenceLine y={25} stroke="#e5e7eb" strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="3 3" />
                <ReferenceLine y={75} stroke="#e5e7eb" strokeDasharray="3 3" />
                <Bar dataKey="hit_rate" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {points.map((point, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColor(point.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="flex items-center gap-5 mt-5 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#179b47]" />
              Underconfident
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1a5da5]" />
              Well calibrated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d82c2c]" />
              Overconfident
            </span>
          </div>
        </div>

        {/* Row 1, Box 2: Profit over time */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col">
          <h3 className="text-base font-bold mb-1">Profit over time</h3>
          <p className="text-sm text-gray-500 mb-5">Your running grading profit, after fees</p>

          {profitLoading ? (
            <div className="h-72 w-full bg-gray-100 rounded animate-pulse" />
          ) : profit.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
              No profit data yet.
            </div>
          ) : (
            <div className="flex-1 flex items-center">
              <ResponsiveContainer width="100%" height={288}>
                <LineChart data={profit} margin={{ top: 10, right: 15, left: 15, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    padding={{ left: 20, right: 20 }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    label={{ value: "Month", position: "insideBottom", offset: -10, fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(v) => `$${v}`}
                    label={{ value: "Profit", angle: -90, position: "insideLeft", offset: 0, style: { textAnchor: "middle", fill: "#9ca3af", fontSize: 12 } }}
                  />
                  <Tooltip
                    cursor={{ stroke: "#e5e7eb" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null
                      const value = payload[0].value as number
                      const isProfit = value >= 0
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm">
                          <div className="text-gray-500 mb-1">{label}</div>
                          <div className={isProfit ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                            {isProfit ? "Profit" : "Loss"}: {value >= 0 ? "+" : "-"}${Math.abs(value)}
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#16a34a" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Row 2, Box 1: What your data says */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col">
          <h3 className="text-base font-bold mb-1">What your data says</h3>
          <p className="text-sm text-gray-500 mb-5">Patterns worth acting on next submission.</p>

          {loading || issuesLoading ? (
            <div className="h-24 w-full bg-gray-100 rounded animate-pulse" />
          ) : insights.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400 py-8 text-center">
              Insights appear once you have graded cards.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {insights.map((insight, i) => {
                const s = insightStyles[insight.type]
                return (
                  <div key={i} className={`flex gap-3 p-3 rounded-lg ${s.bg}`}>
                    <div className={`w-6 h-6 rounded-full ${s.iconBg} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{insight.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{insight.body}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Row 2, Box 2: Predicted issues vs actual outcome */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col">
          <h3 className="text-base font-bold mb-1">Predicted issues vs. actual outcome</h3>
          <p className="text-sm text-gray-500 mb-5">
            When you flagged each issue, how did those cards actually grade?
          </p>

        {issuesLoading ? (
          <div className="h-40 w-full bg-gray-100 rounded animate-pulse" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                <th className="pb-2 font-medium">Issue you flagged</th>
                <th className="pb-2 font-medium text-right">Times</th>
                <th className="pb-2 font-medium text-right">Avg grade</th>
                <th className="pb-2 font-medium text-right">Hit target?</th>
                <th className="pb-2 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, i) => {
                const neverFlagged = issue.flag_count === 0
                return (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className={`py-3 font-medium ${neverFlagged ? "text-gray-400" : ""}`}>
                      {issue.issue_name}
                    </td>
                    <td className="py-3 text-right text-gray-600">{issue.flag_count}</td>
                    <td className="py-3 text-right text-gray-600">
                      {issue.avg_grade !== null ? issue.avg_grade : "—"}
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {issue.hit_rate !== null ? `${issue.hit_rate}%` : "—"}
                    </td>
                    <td className="py-3 pl-3">
                      {issue.hit_rate !== null ? (
                        <span className="block h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <span
                            className="block h-full rounded-full"
                            style={{ width: `${issue.hit_rate}%`, backgroundColor: barColor(issue.hit_rate) }}
                          />
                        </span>
                      ) : (
                        <span className="block h-1.5 w-full bg-gray-100 rounded-full" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </div>
  )
}