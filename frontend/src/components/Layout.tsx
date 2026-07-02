import { Outlet, NavLink } from "react-router-dom"

export default function Layout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 cursor-pointer ${
      isActive
        ? "bg-white/[0.18] text-white font-semibold"
        : "text-[#ffd9d2] font-medium hover:bg-white/[0.14] hover:text-white"
    }`

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — shows on every page */}
      <aside className="w-64 bg-[#e3350d] text-white px-4 py-8 flex flex-col flex-shrink-0">
        {/* Brand: icon + name + tagline */}
        <div className="flex items-center px-2 gap-2 mb-8">
          <svg width="32" height="40" viewBox="0 0 110 176" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="110" height="176" rx="11" fill="white" />
            <rect x="12" y="11" width="86" height="35" rx="5" fill="#e3350d" />
            <text x="55" y="37" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="white">10</text>
            <rect x="13" y="55" width="84" height="110" rx="5" fill="#16a34a" opacity="0.14" />
            <polyline points="26,150 46,128 64,134 86,92" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="78,96 86,92 83,100" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <h2 className="text-xl font-bold leading-tight">SlabPal</h2>
            <div className="text-[11px] uppercase tracking-wide text-[#ffd9d2]">
              grade · track · profit
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5">
          <NavLink to="/" end className={linkClass}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </NavLink>

          <NavLink to="/batches" className={linkClass}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7l9-4 9 4-9 4-9-4z" />
              <path d="M3 7v10l9 4 9-4V7" />
              <path d="M12 11v10" />
            </svg>
            Batches
          </NavLink>

          <NavLink to="/analytics" className={linkClass}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M7 14l4-4 3 3 5-6" />
            </svg>
            Analytics
          </NavLink>
        </nav>

        {/* New submission CTA */}
        <div className="mt-auto">
          <NavLink to="/Submission" className="block text-center bg-[#f0b429] text-[#2a2a32] py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all duration-150 hover:brightness-105"
          >
            + New submission
          </NavLink>
        </div>
      </aside>

      {/* Main content area — scrolls internally, padding for all pages */}
      <main className="flex-1 bg-gray-100 overflow-y-auto p-9 py-7">
        <Outlet />
      </main>
    </div>
  )
}