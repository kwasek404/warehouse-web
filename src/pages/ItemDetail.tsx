import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Loader2, Box, ShoppingBag } from 'lucide-react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import PhotoCapture from '../components/PhotoCapture'
import { useItem, useUpdateItem, useDeleteItem, useCreateCheckout, useReturnCheckout, useAllBoxes } from '../hooks/useApi'

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: item, isLoading, error } = useItem(id!)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const deleteItem = useDeleteItem()
  const returnCheckout = useReturnCheckout()

  async function handleDelete() {
    await deleteItem.mutateAsync(id!)
    navigate(-1)
  }

  if (isLoading) {
    return <Layout title=""><div className="flex justify-center py-12 text-gray-400"><Loader2 size={24} className="animate-spin" /></div></Layout>
  }
  if (error || !item) {
    return <Layout title="Not found"><p className="p-4 text-sm text-red-500">{(error as Error)?.message ?? 'Item not found'}</p></Layout>
  }

  return (
    <Layout
      title={item.name}
      back={<button onClick={() => navigate(-1)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 -ml-1"><ArrowLeft size={20} /></button>}
      actions={
        <div className="flex items-center gap-1">
          <button onClick={() => setShowEdit(true)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><Pencil size={18} /></button>
          <button onClick={() => setShowDelete(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100"><Trash2 size={18} /></button>
        </div>
      }
    >
      {item.photo_url && (
        <img src={item.photo_url} alt={item.name} className="w-full h-48 object-cover" />
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Quantity</span>
          <span className="font-semibold text-lg">{item.quantity}</span>
        </div>
        {item.box_id && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Box</span>
            <Link to={`/boxes/${item.box_id}`} className="flex items-center gap-1 text-blue-600 text-sm">
              <Box size={14} />
              View box
            </Link>
          </div>
        )}
        {item.description && (
          <div>
            <span className="text-sm text-gray-500">Description</span>
            <p className="mt-1 text-sm text-gray-700">{item.description}</p>
          </div>
        )}
        {item.tags && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.split(',').map(tag => (
              <span key={tag.trim()} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{tag.trim()}</span>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowCheckout(true)}
          disabled={item.quantity === 0}
          className="w-full mt-2 py-2.5 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingBag size={16} />
          Check out
        </button>
      </div>

      {item.active_checkouts.length > 0 && (
        <section>
          <div className="px-4 py-2 bg-gray-50 border-t border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active checkouts</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {item.active_checkouts.map(co => (
              <li key={co.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">x{co.quantity}</p>
                  {co.reason && <p className="text-xs text-gray-500 truncate">{co.reason}</p>}
                  <p className="text-xs text-gray-400">{new Date(co.checked_out_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => returnCheckout.mutate({ id: co.id })}
                  disabled={returnCheckout.isPending}
                  className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50"
                >
                  Return
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showCheckout && <CheckoutModal itemId={id!} maxQty={item.quantity} onClose={() => setShowCheckout(false)} />}
      {showEdit && <EditItemModal item={item} onClose={() => setShowEdit(false)} />}
      {showDelete && (
        <Modal title="Delete item?" onClose={() => setShowDelete(false)} footer={
          <div className="flex gap-2">
            <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600">Cancel</button>
            <button onClick={handleDelete} disabled={deleteItem.isPending} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              {deleteItem.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }>
          <p className="text-sm text-gray-600">Permanently delete <strong>{item.name}</strong>?</p>
          {item.active_checkouts.length > 0 && <p className="mt-1 text-xs text-yellow-600">This item has active checkouts.</p>}
          {deleteItem.error && <p className="mt-2 text-xs text-red-500">{(deleteItem.error as Error).message}</p>}
        </Modal>
      )}
    </Layout>
  )
}

function CheckoutModal({ itemId, maxQty, onClose }: { itemId: string; maxQty: number; onClose: () => void }) {
  const [quantity, setQuantity] = useState('1')
  const [reason, setReason] = useState('')
  const checkout = useCreateCheckout()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await checkout.mutateAsync({ item_id: itemId, quantity: parseInt(quantity) || 1, reason: reason || null })
    onClose()
  }

  return (
    <Modal title="Check out" onClose={onClose} footer={
      <button form="checkout-form" type="submit" disabled={checkout.isPending}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {checkout.isPending ? 'Checking out...' : 'Check out'}
      </button>
    }>
      <form id="checkout-form" onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (max {maxQty})</label>
          <input type="number" min="1" max={maxQty} value={quantity} onChange={e => setQuantity(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Optional"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {checkout.error && <p className="text-xs text-red-500">{(checkout.error as Error).message}</p>}
      </form>
    </Modal>
  )
}

function EditItemModal({ item, onClose }: { item: ReturnType<typeof useItem>['data'] & object; onClose: () => void }) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description ?? '')
  const [quantity, setQuantity] = useState(String(item.quantity))
  const [tags, setTags] = useState(item.tags ?? '')
  const [photoUrl, setPhotoUrl] = useState<string | null>(item.photo_url)
  const [boxId, setBoxId] = useState<string>(item.box_id ?? '')
  const update = useUpdateItem()
  const { data: allBoxes } = useAllBoxes()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await update.mutateAsync({
      id: item.id, name, description: description || null,
      quantity: parseInt(quantity) || 1,
      box_id: boxId || null,
      tags: tags || null,
      photo_url: photoUrl,
    })
    onClose()
  }

  return (
    <Modal title="Edit item" onClose={onClose} footer={
      <button form="edit-item-form" type="submit" disabled={!name.trim() || update.isPending}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {update.isPending ? 'Saving...' : 'Save'}
      </button>
    }>
      <form id="edit-item-form" onSubmit={submit} className="space-y-3">
        {[
          { label: 'Name *', content: <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /> },
          { label: 'Quantity', content: <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /> },
          { label: 'Description', content: <input value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /> },
          { label: 'Tags', content: <input value={tags} onChange={e => setTags(e.target.value)} placeholder="electronics,tools" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /> },
        ].map(({ label, content }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {content}
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Box</label>
          <select value={boxId} onChange={e => setBoxId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">No box</option>
            {allBoxes?.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
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
