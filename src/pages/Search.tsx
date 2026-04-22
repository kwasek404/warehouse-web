import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, Package, ChevronRight, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import { useItems } from '../hooks/useApi'

export default function Search() {
  const [q, setQ] = useState('')
  const { data: items, isLoading } = useItems({ q: q.trim() || undefined })

  return (
    <Layout title="Search">
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search items by name, description or tags..."
            className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {isLoading && q.length > 1 && (
        <div className="flex justify-center py-8 text-gray-400"><Loader2 size={20} className="animate-spin" /></div>
      )}

      {q.length <= 1 && (
        <p className="p-8 text-center text-sm text-gray-400">Type at least 2 characters to search</p>
      )}

      {items && q.length > 1 && items.length === 0 && (
        <p className="p-8 text-center text-sm text-gray-400">No items found for "{q}"</p>
      )}

      {items && items.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {items.map(item => (
            <li key={item.id}>
              <Link to={`/items/${item.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                {item.photo_url ? (
                  <img src={item.photo_url} alt={item.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0"><Package size={16} className="text-gray-500" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {[item.description, item.tags].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="text-sm text-gray-400 flex-shrink-0">x{item.quantity}</span>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  )
}
