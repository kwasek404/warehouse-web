import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Box, ChevronRight, Package, Pencil, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import PhotoCapture from '../components/PhotoCapture'
import { useBox, useBoxes, useCreateBox, useUpdateBox, useDeleteBox, useCreateItem } from '../hooks/useApi'
import type { Box as BoxType } from '../api/types'

export default function BoxDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: box, isLoading, error } = useBox(id!)
  const { data: childBoxes } = useBoxes(id)
  const [showCreateBox, setShowCreateBox] = useState(false)
  const [showCreateItem, setShowCreateItem] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const deleteBox = useDeleteBox()

  async function handleDelete() {
    await deleteBox.mutateAsync(id!)
    navigate(-1)
  }

  if (isLoading) {
    return (
      <Layout title="">
        <div className="flex justify-center py-12 text-gray-400"><Loader2 size={24} className="animate-spin" /></div>
      </Layout>
    )
  }

  if (error || !box) {
    return <Layout title="Not found"><p className="p-4 text-sm text-red-500">{(error as Error)?.message ?? 'Box not found'}</p></Layout>
  }

  return (
    <Layout
      title={box.label}
      back={
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 -ml-1">
          <ArrowLeft size={20} />
        </button>
      }
      actions={
        <div className="flex items-center gap-1">
          <button onClick={() => setShowEdit(true)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><Pencil size={18} /></button>
          <button onClick={() => setShowDelete(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100"><Trash2 size={18} /></button>
          <button onClick={() => setShowCreateItem(true)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Plus size={20} /></button>
        </div>
      }
    >
      {box.description && (
        <p className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">{box.description}</p>
      )}
      {box.photo_url && (
        <img src={box.photo_url} alt={box.label} className="w-full h-40 object-cover" />
      )}

      {childBoxes && childBoxes.length > 0 && (
        <section>
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Boxes</span>
            <button onClick={() => setShowCreateBox(true)} className="text-blue-600 text-xs font-medium">+ Add</button>
          </div>
          <ul className="divide-y divide-gray-100">
            {childBoxes.map(child => (
              <li key={child.id}>
                <Link to={`/boxes/${child.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  <div className="p-2 bg-blue-50 rounded-lg"><Box size={16} className="text-blue-600" /></div>
                  <span className="flex-1 font-medium text-gray-900 truncate">{child.label}</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {childBoxes && childBoxes.length === 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-400">No nested boxes</span>
          <button onClick={() => setShowCreateBox(true)} className="text-blue-600 text-xs font-medium">+ Add box</button>
        </div>
      )}

      {box.items.length > 0 ? (
        <section>
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Items ({box.items.length})</span>
            <button onClick={() => setShowCreateItem(true)} className="text-blue-600 text-xs font-medium">+ Add</button>
          </div>
          <ul className="divide-y divide-gray-100">
            {box.items.map(item => (
              <li key={item.id}>
                <Link to={`/items/${item.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt={item.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0"><Package size={16} className="text-gray-500" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    {item.tags && <p className="text-xs text-gray-400 truncate">{item.tags}</p>}
                  </div>
                  <span className="text-sm text-gray-400 flex-shrink-0">x{item.quantity}</span>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="p-8 text-center text-sm text-gray-400">
          <Package size={32} className="mx-auto mb-2 text-gray-200" />
          Empty box. Tap + to add items.
        </div>
      )}

      {showCreateBox && <BoxFormModal parentId={id} onClose={() => setShowCreateBox(false)} />}
      {showCreateItem && <ItemFormModal boxId={id} onClose={() => setShowCreateItem(false)} />}
      {showEdit && <EditBoxModal box={box} onClose={() => setShowEdit(false)} />}
      {showDelete && (
        <Modal title="Delete box?" onClose={() => setShowDelete(false)} footer={
          <div className="flex gap-2">
            <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600">Cancel</button>
            <button onClick={handleDelete} disabled={deleteBox.isPending} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              {deleteBox.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }>
          <p className="text-sm text-gray-600">This will permanently delete <strong>{box.label}</strong>. The box must be empty.</p>
          {deleteBox.error && <p className="mt-2 text-xs text-red-500">{(deleteBox.error as Error).message}</p>}
        </Modal>
      )}
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
      <button form="box-form-detail" type="submit" disabled={!label.trim() || create.isPending}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {create.isPending ? 'Creating...' : 'Create'}
      </button>
    }>
      <form id="box-form-detail" onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
          <input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder="Box 42"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {create.error && <p className="text-xs text-red-500">{(create.error as Error).message}</p>}
      </form>
    </Modal>
  )
}

function EditBoxModal({ box, onClose }: { box: BoxType; onClose: () => void }) {
  const [label, setLabel] = useState(box.label)
  const [description, setDescription] = useState(box.description ?? '')
  const [photoUrl, setPhotoUrl] = useState<string | null>(box.photo_url)
  const update = useUpdateBox()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await update.mutateAsync({ id: box.id, label, description: description || null, photo_url: photoUrl })
    onClose()
  }

  return (
    <Modal title="Edit box" onClose={onClose} footer={
      <button form="edit-box-form" type="submit" disabled={!label.trim() || update.isPending}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {update.isPending ? 'Saving...' : 'Save'}
      </button>
    }>
      <form id="edit-box-form" onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
          <input value={label} onChange={e => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
          <PhotoCapture value={photoUrl} onChange={setPhotoUrl} />
        </div>
        {update.error && <p className="text-xs text-red-500">{(update.error as Error).message}</p>}
      </form>
    </Modal>
  )
}

function ItemFormModal({ onClose, boxId }: { onClose: () => void; boxId?: string }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [tags, setTags] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const create = useCreateItem()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await create.mutateAsync({
      name, description: description || null,
      quantity: parseInt(quantity) || 1,
      box_id: boxId ?? null,
      tags: tags || null,
      photo_url: photoUrl,
    })
    onClose()
  }

  return (
    <Modal title="New item" onClose={onClose} footer={
      <button form="item-form" type="submit" disabled={!name.trim() || create.isPending}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {create.isPending ? 'Creating...' : 'Create'}
      </button>
    }>
      <form id="item-form" onSubmit={submit} className="space-y-3">
        <Field label="Name *">
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Item name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </Field>
        <Field label="Quantity">
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </Field>
        <Field label="Description">
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </Field>
        <Field label="Tags">
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="electronics,tools"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </Field>
        <Field label="Photo">
          <PhotoCapture value={photoUrl} onChange={setPhotoUrl} />
        </Field>
        {create.error && <p className="text-xs text-red-500">{(create.error as Error).message}</p>}
      </form>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
