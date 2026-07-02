import { useState } from "react"

interface StagedCard {
  pokemon_name: string
  set_string: string
  raw_value: string
  target_grade: number
  confidence: number
  issue_type_ids: number[]
}

// issue label -> id (matches your issue_types table, ids 1-7)
const ISSUE_OPTIONS = [
  { id: 1, label: "Off-center" },
  { id: 2, label: "Scratched surface" },
  { id: 3, label: "Edge whitening" },
  { id: 4, label: "Soft corner" },
  { id: 5, label: "Print line" },
  { id: 6, label: "Dimple / dent" },
  { id: 7, label: "Staining" },
]

export default function Submission() {
  // --- Batch details state ---
  const [batchName, setBatchName] = useState("")
  const [gradingCompany, setGradingCompany] = useState("PSA")
  const [fees, setFees] = useState("")

  // --- Current card being built ---
  const [cardName, setCardName] = useState("")
  const [setString, setSetString] = useState("")
  const [rawValue, setRawValue] = useState("")
  const [targetGrade, setTargetGrade] = useState<number | null>(null)
  const [confidence, setConfidence] = useState(8)
  const [selectedIssues, setSelectedIssues] = useState<number[]>([])

  // --- Staged cards (frontend only, until submit) ---
  const [cards, setCards] = useState<StagedCard[]>([])

  // toggle an issue id in/out of the selection
  function toggleIssue(id: number) {
    setSelectedIssues((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // is the current card fully filled (photos + issues optional)?
  const isCardValid =
    cardName.trim() !== "" &&
    setString.trim() !== "" &&
    rawValue.trim() !== "" &&
    targetGrade !== null

  // are the batch details all filled?
  const isBatchValid =
    batchName.trim() !== "" && gradingCompany.trim() !== "" && fees.trim() !== ""

  // can we submit? valid batch details + at least one card
  const canSubmit = isBatchValid && cards.length > 0

  function addCard() {
    if (!isCardValid) return
    setCards([
      ...cards,
      {
        pokemon_name: cardName.trim(),
        set_string: setString.trim(),
        raw_value: rawValue,
        target_grade: targetGrade as number,
        confidence,
        issue_type_ids: selectedIssues,
      },
    ])
    // reset the card fields for the next one
    setCardName("")
    setSetString("")
    setRawValue("")
    setTargetGrade(null)
    setConfidence(8)
    setSelectedIssues([])
  }

  function removeCard(index: number) {
    setCards(cards.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    if (!canSubmit) return
    // TODO: POST batch to /batches, then each card to /batches/{id}/cards
    console.log("Submitting batch:", { batchName, gradingCompany, fees, cards })
  }

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 -mx-9 px-9">
        <div>
          <div className="text-sm text-gray-400">New submission</div>
          <div className="text-2xl font-bold">Start a new batch</div>
        </div>
      </div>

      <div className="max-w-3xl flex flex-col gap-5">
        {/* Batch details */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-base font-bold mb-1">Batch details</h3>
          <p className="text-sm text-gray-500 mb-5">Where these cards are going and what it costs.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Batch name</label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="Base Set vintage run"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e3350d] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Grading company</label>
              <select
                value={gradingCompany}
                onChange={(e) => setGradingCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#e3350d] focus:border-transparent"
              >
                <option>PSA</option>
                <option>CGC</option>
                <option>BGS</option>
                <option>SGC</option>
                <option>TAG</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Grading fees (total)</label>
              <input
                type="number"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e3350d] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Add a card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-base font-bold mb-1">Add a card</h3>
          <p className="text-sm text-gray-500 mb-5">Log what you see, and call your shot.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Card name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Charizard"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e3350d] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Set</label>
              <input
                type="text"
                value={setString}
                onChange={(e) => setSetString(e.target.value)}
                placeholder="Base Set 1999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e3350d] focus:border-transparent"
              />
            </div>
          </div>

          {/* Photos — front & back (optional) */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Photos — front &amp; back</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1 h-28 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-[#e3350d] hover:text-[#e3350d] transition-colors"
              >
                <span className="text-2xl leading-none">＋</span>
                <span className="text-sm">Front of card</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1 h-28 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-[#e3350d] hover:text-[#e3350d] transition-colors"
              >
                <span className="text-2xl leading-none">＋</span>
                <span className="text-sm">Back of card</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Raw market value (now)</label>
              <input
                type="number"
                value={rawValue}
                onChange={(e) => setRawValue(e.target.value)}
                placeholder="220"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e3350d] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Targeted grade</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setTargetGrade(g)}
                    className={`py-2 border rounded-lg text-sm font-semibold transition-colors ${
                      targetGrade === g
                        ? "bg-[#e3350d] border-[#e3350d] text-white"
                        : "border-gray-300 text-gray-700 hover:border-[#e3350d] hover:text-[#e3350d]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Possible issues (optional) */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Possible issues you see</label>
            <div className="flex flex-wrap gap-2">
              {ISSUE_OPTIONS.map((issue) => {
                const selected = selectedIssues.includes(issue.id)
                return (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => toggleIssue(issue.id)}
                    className={`px-3 py-1.5 border rounded-full text-sm transition-colors ${
                      selected
                        ? "bg-[#e3350d] border-[#e3350d] text-white"
                        : "border-gray-300 text-gray-700 hover:border-[#e3350d] hover:text-[#e3350d]"
                    }`}
                  >
                    {issue.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Confidence */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How confident are you in hitting that grade?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="flex-1 accent-[#e3350d]"
              />
              <div className="w-9 h-9 rounded-lg bg-[#e3350d] text-white flex items-center justify-center font-bold text-sm">
                {confidence}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1.5 pr-12">
              <span>1 · long shot</span>
              <span>10 · lock</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
            <span className="text-xs text-gray-400">{cards.length} cards added</span>
            <button
              type="button"
              onClick={addCard}
              disabled={!isCardValid}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isCardValid
                  ? "bg-[#e3350d] text-white cursor-pointer hover:brightness-105"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              + Add card to batch
            </button>
          </div>
        </div>

        {/* Cards in this batch — review */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-base font-bold mb-1">Cards in this batch</h3>
          <p className="text-sm text-gray-500 mb-5">Review before you submit.</p>

          {cards.length === 0 ? (
            <div className="text-sm text-gray-400 py-6 text-center">
              No cards added yet — fill out a card above and click "Add card to batch".
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cards.map((card, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-11 bg-gray-200 rounded flex-shrink-0" />
                  <div className="flex-1 text-sm">
                    <span className="font-semibold">{card.pokemon_name}</span>
                    <span className="text-gray-400"> · {card.set_string}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs font-medium">
                    conf {card.confidence}
                  </span>
                  <span className="text-xs text-gray-400">target {card.target_grade}</span>
                  <button
                    type="button"
                    onClick={() => removeCard(i)}
                    className="text-gray-400 hover:text-[#e3350d] text-lg leading-none px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
            <span className="text-xs text-gray-400">{cards.length} cards added</span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 ${
                canSubmit
                  ? "bg-[#f0b429] text-[#2a2a32] cursor-pointer hover:brightness-105"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Submit batch →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}