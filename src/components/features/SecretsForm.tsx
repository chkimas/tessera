'use client'

import { useState } from 'react'
import { createSecretAction } from '@/actions/secret-actions'

export default function SecretsForm({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      orgId,
      keyName: formData.get('keyName') as string,
      secretValue: formData.get('secretValue') as string,
    }

    const result = await createSecretAction(data)

    if (result.success) {
      setMessage('Secret stored securely.')
      e.currentTarget.reset()
    } else {
      setMessage(`Error: ${result.error}`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Vault Management</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Key Name</label>
          <input
            name="keyName"
            placeholder="e.g. OPENAI_API_KEY"
            className="w-full p-2 mt-1 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Value</label>
          <input
            name="secretValue"
            type="password"
            placeholder="••••••••"
            className="w-full p-2 mt-1 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded-md font-medium disabled:bg-slate-400"
        >
          {loading ? 'Encrypting...' : 'Save to Vault'}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-center font-medium">{message}</p>}
    </div>
  )
}
