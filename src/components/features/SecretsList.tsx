'use client'

import { deleteSecretAction } from '@/actions/secret-actions'
import { Trash2, Key } from 'lucide-react'

interface SecretMetadata {
  id: string
  keyName: string
  createdAt: Date
}

export default function SecretsList({ secrets }: { secrets: SecretMetadata[] }) {
  async function handleDelete(id: string) {
    if (!confirm('Delete this secret? This action cannot be undone.')) return
    const result = await deleteSecretAction(id)
    if (!result.success) alert(result.error)
  }

  if (secrets.length === 0) {
    return (
      <div className="py-20 text-center">
        <Key className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-900">No secrets stored</p>
        <p className="text-xs text-slate-500 mt-1">Add your first secret to get started</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-slate-200">
      {secrets.map(secret => (
        <li
          key={secret.id}
          className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 group"
        >
          <div>
            <p className="text-sm font-mono font-bold text-slate-900">{secret.keyName}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Added {new Date(secret.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => handleDelete(secret.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}
