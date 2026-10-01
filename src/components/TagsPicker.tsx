import { useState } from 'react'
import { X } from 'lucide-react'
import { useItemTags } from '../hooks/useApi'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function TagsPicker({ value, onChange }: Props) {
  const [input, setInput] = useState('')
  const { data: allTags = [] } = useItemTags()

  const selected = value ? value.split(',').map(t => t.trim()).filter(Boolean) : []

  function toggle(tag: string) {
    const next = selected.includes(tag)
      ? selected.filter(t => t !== tag)
      : [...selected, tag]
    onChange(next.join(','))
  }

  function addNew() {
    const tag = input.trim()
    if (!tag || selected.includes(tag)) { setInput(''); return }
    onChange([...selected, tag].join(','))
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); addNew() }
    if (e.key === 'Backspace' && !input && selected.length > 0) {
      toggle(selected[selected.length - 1])
    }
  }

  const suggestions = allTags.filter(t => !selected.includes(t))

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(tag => (
            <button key={tag} type="button" onClick={() => toggle(tag)}
              className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {tag}<X size={10} />
            </button>
          ))}
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map(tag => (
            <button key={tag} type="button" onClick={() => toggle(tag)}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200">
              + {tag}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New tag..."
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {input.trim() && (
          <button type="button" onClick={addNew}
            className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-200">
            Add
          </button>
        )}
      </div>
    </div>
  )
}
