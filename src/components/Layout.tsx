import { NavLink } from 'react-router-dom'
import { Archive, Search, ShoppingBag, Settings } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title?: string
  back?: ReactNode
  actions?: ReactNode
}

export default function Layout({ children, title, back, actions }: Props) {
  return (
    <div className="flex flex-col h-dvh max-w-2xl mx-auto bg-white">
      {title !== undefined && (
        <header className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
          {back}
          <h1 className="flex-1 text-lg font-semibold text-gray-900 truncate">{title}</h1>
          {actions}
        </header>
      )}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <nav className="flex border-t border-gray-100 bg-white pb-safe">
        <NavItem to="/boxes" icon={<Archive size={22} />} label="Boxes" />
        <NavItem to="/search" icon={<Search size={22} />} label="Search" />
        <NavItem to="/checkouts" icon={<ShoppingBag size={22} />} label="Out" />
        <NavItem to="/settings" icon={<Settings size={22} />} label="Settings" />
      </nav>
    </div>
  )
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
          isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}
