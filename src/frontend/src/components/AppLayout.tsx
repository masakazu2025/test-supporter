import { NavLink, Outlet } from 'react-router'

const NAV_ITEMS = [
  { to: '/terminal', label: '端末' },
  { to: '/evaluation', label: '評価' },
  { to: '/settings', label: '設定' },
]

export default function AppLayout() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-1 border-b border-gray-200 bg-white px-4">
        <span className="mr-6 py-3 text-sm font-semibold text-gray-700">Test Supporter</span>
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </header>
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
