import { Link } from 'react-router-dom'
import { Package, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import { useCheckouts, useReturnCheckout } from '../hooks/useApi'

export default function Checkouts() {
  const { data: checkouts, isLoading, error } = useCheckouts()
  const returnCheckout = useReturnCheckout()

  return (
    <Layout title="Checked Out">
      {isLoading && (
        <div className="flex justify-center py-12 text-gray-400"><Loader2 size={24} className="animate-spin" /></div>
      )}
      {error && <p className="p-4 text-sm text-red-500">{(error as Error).message}</p>}
      {checkouts && checkouts.length === 0 && (
        <div className="p-8 text-center text-sm text-gray-400">
          <Package size={32} className="mx-auto mb-2 text-gray-200" />
          Nothing checked out
        </div>
      )}
      {checkouts && checkouts.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {checkouts.map(co => (
            <li key={co.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <Link to={`/items/${co.item_id}`} className="font-medium text-blue-600 hover:text-blue-700 truncate block">
                  {co.item_name}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">x{co.quantity}</span>
                  {co.reason && <span className="text-xs text-gray-400 truncate">{co.reason}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(co.checked_out_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => returnCheckout.mutate({ id: co.id })}
                disabled={returnCheckout.isPending}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50"
              >
                Return
              </button>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  )
}
