'use client'

import { deleteSecretAction } from '@/actions/secret-actions'
import { Trash2, Lock } from 'lucide-react'

interface SecretMetadata {
  id: string
  keyName: string
  createdAt: Date
}

export default function SecretsList({ secrets }: { secrets: SecretMetadata[] }) {
  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this secret?')) return
    const result = await deleteSecretAction(id)
    if (!result.success) alert(result.error)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Vaulted Credentials
        </h3>
      </div>
      <ul className="divide-y divide-slate-100">
        {secrets.length === 0 ? (
          <li className="p-8 text-center text-sm text-slate-400">No secrets found.</li>
        ) : (
          secrets.map(secret => (
            <li
              key={secret.id}
              className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="text-sm font-mono font-medium text-slate-800">{secret.keyName}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Added {new Date(secret.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(secret.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                aria-label={`Delete ${secret.keyName}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
