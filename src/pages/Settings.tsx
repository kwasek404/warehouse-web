import { useState } from 'react'
import Layout from '../components/Layout'
import { getApiBase, getToken } from '../api/client'

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(getApiBase)
  const [token, setToken] = useState(getToken)
  const [saved, setSaved] = useState(false)

  function save(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('warehouse_api_url', apiUrl.trim().replace(/\/$/, ''))
    localStorage.setItem('warehouse_api_token', token.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout title="Settings">
      <form onSubmit={save} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API base URL</label>
          <input
            type="url"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            placeholder="https://warehouse-api.kwasek.workers.dev"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API token</label>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Paste your API token"
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
    </Layout>
  )
}
