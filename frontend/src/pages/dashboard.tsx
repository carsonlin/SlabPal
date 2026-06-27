import OverviewCard from "../components/OverviewCard"
import BatchList from "../components/BatchList"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#e3350d] text-white p-4">
        <h2 className="text-xl font-bold mb-6">SlabPal</h2>
        <nav className="flex flex-col gap-2">
          <a className="hover:text-yellow-400 cursor-pointer">Dashboard</a>
          <a className="hover:text-yellow-400 cursor-pointer">Batches</a>
          <a className="hover:text-yellow-400 cursor-pointer">Analytics</a>
        </nav>
      </aside>

      {/* Main area */}
      <main className="flex-1 p-9 py-7 bg-gray-100">        
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 -mx-9 px-9">
            {/* Left: breadcrumb + title */}
            <div>
                <div className="text-sm text-gray-400">Overview</div>
                <div className="text-2xl font-bold">Welcome back, Alex</div>
            </div>

            {/* Right: filter toggle + avatar */}
            <div className="flex items-center gap-4">
                {/* Pill toggle — the 3 filter buttons */}
                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <button className="px-3 py-1.5 text-sm bg-[#e3350d] text-white">All time</button>
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">This year</button>
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">90 days</button>
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm cursor-pointer">AL</div>
            </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <OverviewCard
            label="Net grading profit"
            value="+$2,418"
            accent="bg-red-600"
            subtitle="value added, after fees"
            tone="positive"
          />
          <OverviewCard
            label="Cards graded"
            value="147"
            accent="bg-yellow-400"
            subtitle="across 18 batches"
            tone="neutral"
          />
          <OverviewCard
            label="Grade hit rate"
            value="68%"
            accent="bg-green-500"
            subtitle="6% vs last quarter"
            tone="positive"
          />
          <OverviewCard
            label="Best card"
            value="Mega lopunny #199"
            accent="bg-blue-500"
            subtitle="Profit +$612"
            tone="positive"
          />
        </div>

        {/* Batch list */}
        <div>
          <h2 className="text-xs text-gray-500 font-bold mb-4">RECENT BATCHES</h2>
          <BatchList />
        </div>
      </main>
    </div>
  )
}