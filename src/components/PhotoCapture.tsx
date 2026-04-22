import { useRef, useState } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import { api } from '../api/client'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
}

export default function PhotoCapture({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const { url } = await api.photos.upload(file)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Item photo" className="h-32 w-32 object-cover rounded-lg border border-gray-200" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 shadow text-gray-500 hover:text-red-500"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          {uploading ? 'Uploading...' : 'Add photo'}
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
