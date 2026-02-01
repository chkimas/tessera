'use client'

import { useState } from 'react'
import { createSecretAction } from '@/actions/secret-actions'
import { ShieldPlus, Loader2 } from 'lucide-react'

export default function SecretsForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const keyName = formData.get('keyName') as string
    const secretValue = formData.get('secretValue') as string

    const result = await createSecretAction(keyName, secretValue)

    if (result.success) {
      setMessage('Secret stored securely.')
      e.currentTarget.reset()
    } else {
      setMessage(`Error: ${result.error}`)
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4"
    >
      <header className="flex items-center gap-2 mb-2">
        <ShieldPlus className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
          Add New Secret
        </h3>
      </header>

      <div className="space-y-3">
        <input
          name="keyName"
          placeholder="e.g., SLACK_BOT_TOKEN"
          required
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
        />
        <input
          name="secretValue"
          type="password"
          placeholder="Value"
          required
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <button
        disabled={loading}
        className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Vault Secret'}
      </button>

      {message && (
        <p
          className={`text-[10px] font-bold text-center uppercase tracking-widest ${message.includes('Error') ? 'text-rose-500' : 'text-emerald-500'}`}
        >
          {message}
        </p>
      )}
    </form>
  )
}
