import { useState } from "react"
import { API_BASE } from "../api"
import type { CardOut } from "../types"

interface ResultsModalProps {
  batchId: string
  batchName: string
  cards: CardOut[]
  onClose: () => void
  onSaved: () => void   // called after a successful save (e.g. to re-fetch the batch)
}

interface ResultEntry {
  actual_grade: string   // "" = not entered
  graded_value: string   // "" = not entered
}


export default function ResultsModal({batchId, batchName, cards, onClose, onSaved}: ResultsModalProps){
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [entries, setEntries] = useState<Record<string, ResultEntry>>(() => {
    const initial: Record<string, ResultEntry> = {}
    for (const c of cards) {
      initial[c.id] = {
        actual_grade: c.actual_grade !== null ? String(c.actual_grade) : "",
        graded_value: c.graded_value !== null ? c.graded_value : "",
      }
    }
    return initial
  })

  const allFilled = cards.every(
    (c) => entries[c.id].actual_grade !== "" && entries[c.id].graded_value !== ""
  )

  async function handleSave() {
    if (!allFilled) {
      setError("Please fill out all fields before saving")
      setSaving(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      // one atomic request: all card grades + batch status flip, all-or-nothing on the server
      const res = await fetch(`${API_BASE}/batches/${batchId}/results`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: cards.map((c) => ({
            id: c.id,
            actual_grade: Number(entries[c.id].actual_grade),
            graded_value: entries[c.id].graded_value,
          })),
        }),
      })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      onSaved()
      onClose()
    } catch (err) {
      setError("Couldn't save results. Please try again.")
    } finally {
      setSaving(false)
    }
  }

    function updateEntry(cardId: string, field: keyof ResultEntry, value: string) {
    setEntries((prev) => ({
      ...prev,
      [cardId]: { ...prev[cardId], [field]: value },
    }))
  }



  return (
  <div className= "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header — with bottom border */}
        <div className="px-6 py-4 border-b border-gray-300">
            <div className="flex justify-between items-start mb-1">
            <h1 className="font-semibold text-lg">{`Enter Results — ${batchName}`}</h1>
            <button onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-600 cursor-pointer">×</button>
            </div>
            <div className="text-xs text-[#8a8a95]">Log the grade each card came back with and its graded market value. Profit updates automatically.</div>
        </div>

        {/* Body — the card rows go here */}
        <div className="px-6 py-2 border-b border-gray-300">
            {cards.map((card) => (
            <div key={card.id} className="flex items-center justify-between py-3.5 border-b border-gray-200 last:border-0 ">
                {/* Left: thumbnail + name/subtext */}
                <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{card.pokemon_name}</div>
                    <div className="text-xs text-[#8a8a95] truncate">{card.set_string} · target {card.target_grade}</div>
                </div>
                </div>

                {/* Right: select + input, grouped */}
                <div className="flex gap-3 flex-shrink-0">
                <div className="w-24">
                    <span className="block text-[10px] text-[#8a8a95] mb-1">Actual grade</span>
                    <select
                    value={entries[card.id].actual_grade}
                    onChange={(e) => updateEntry(card.id, "actual_grade", e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#e3350d] focus:border-transparent">
                      <option value="">—</option>
                      {[10,9,8,7,6,5,4,3,2,1].map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div className="w-28">
                    <span className="block text-[10px] text-[#8a8a95] mb-1">Graded value</span>
                    <input type="number" 
                    placeholder="$0" 
                    value={entries[card.id].graded_value}
                    onChange={(e) => updateEntry(card.id, "graded_value", e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#e3350d] focus:border-transparent" />
                </div>
                </div>
            </div>
            ))}
        </div>
        <div className="px-6 py-4 flex justify-between items-center">
            <div className="text-xs text-[#8a8a95]">{error}</div>
            <button
              onClick={handleSave}
              disabled={!allFilled || saving}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                allFilled && !saving
                  ? "bg-[#e3350d] text-white hover:bg-[#c62d0b] cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving..." : "Save results"}
          </button>
        </div>
    </div>
  </div>
  )



}