import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Box, ChevronRight, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import { useBoxes, useCreateBox } from '../hooks/useApi'

export default function BoxList() {
  const { data: boxes, isLoading, error } = useBoxes(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <Layout
      title="Boxes"
      actions={
        <button onClick={() => setShowCreate(true)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
          <Plus size={20} />
        </button>
      }
    >
      {isLoading && (
        <div className="flex justify-center py-12 text-gray-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      )}
      {error && <p className="p-4 text-sm text-red-500">{(error as Error).message}</p>}
      {boxes && boxes.length === 0 && (
        <p className="p-8 text-center text-sm text-gray-400">No boxes yet. Tap + to create one.</p>
      )}
      {boxes && (
        <ul className="divide-y divide-gray-100">
          {boxes.map(box => (
            <li key={box.id}>
              <Link to={`/boxes/${box.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Box size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{box.label}</p>
                  {box.description && (
                    <p className="text-xs text-gray-500 truncate">{box.description}</p>
                  )}
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {showCreate && <BoxFormModal onClose={() => setShowCreate(false)} />}
    </Layout>
  )
}

function BoxFormModal({ onClose, parentId }: { onClose: () => void; parentId?: string }) {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const create = useCreateBox()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await create.mutateAsync({ label, description: description || null, parent_id: parentId ?? null })
    onClose()
  }

  return (
    <Modal title="New box" onClose={onClose} footer={
      <button
        form="box-form"
        type="submit"
        disabled={!label.trim() || create.isPending}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {create.isPending ? 'Creating...' : 'Create'}
      </button>
    }>
      <form id="box-form" onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
          <input
            autoFocus
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Box 42"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {create.error && <p className="text-xs text-red-500">{(create.error as Error).message}</p>}
      </form>
    </Modal>
  )
}

export { BoxFormModal }
