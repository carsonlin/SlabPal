import BatchList from "../components/BatchList"

export default function Batches() {
  return (
    <div className="animate-fade-in">
      {/* Header bar — matches the dashboard's header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 -mx-9 px-9">
        <div>
          <div className="text-sm text-gray-400">History</div>
          <div className="text-2xl font-bold">All batches</div>
        </div>

        <button className="bg-[#e3350d] text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150 hover:brightness-105">
          + New submission
        </button>
      </div>

      {/* Batch list (all batches — no limit) */}
      <BatchList />
    </div>
  )
}