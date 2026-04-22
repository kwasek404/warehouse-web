import { useState } from 'react'
import Layout from '../components/Layout'
import { isConfigured } from '../api/client'

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('warehouse_api_url') ?? '')
  const [token, setToken] = useState(() => localStorage.getItem('warehouse_api_token') ?? '')
  const [saved, setSaved] = useState(false)

  const effectiveUrl = apiUrl.trim() || import.meta.env.VITE_API_BASE_URL || '(not set)'
  const tokenConfigured = isConfigured()

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (apiUrl.trim()) {
      localStorage.setItem('warehouse_api_url', apiUrl.trim().replace(/\/$/, ''))
    } else {
      localStorage.removeItem('warehouse_api_url')
    }
    if (token.trim()) {
      localStorage.setItem('warehouse_api_token', token.trim())
    } else {
      localStorage.removeItem('warehouse_api_token')
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout title="Settings">
      <div className="p-4 space-y-5">
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-500 space-y-1">
          <div>Effective API URL: <span className="font-mono text-gray-700">{effectiveUrl}</span></div>
          <div>Token: {tokenConfigured ? <span className="text-green-600">configured</span> : <span className="text-red-500">missing</span>}</div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API URL override
              <span className="ml-1 font-normal text-gray-400">(leave empty to use built-in)</span>
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              placeholder={import.meta.env.VITE_API_BASE_URL || 'https://warehouse-api.kwasek.workers.dev'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token override
              <span className="ml-1 font-normal text-gray-400">(leave empty to use built-in)</span>
            </label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Leave empty to use built-in token"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
