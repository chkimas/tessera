'use client'

import { useState } from 'react'

export default function SecretsManager({ orgId }: { orgId: string }) {
  const [keyName, setKeyName] = useState('')
  const [value, setValue] = useState('')

  async function handleSave() {
    const response = await fetch('/api/secrets', {
      method: 'POST',
      body: JSON.stringify({ orgId, keyName, value }),
    })

    if (response.ok) {
      alert('Secret encrypted and stored in Vault.')
      setKeyName('')
      setValue('')
    }
  }

  return (
    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
      <h3 className="text-sm font-bold text-slate-700 mb-4">Add Encrypted Secret</h3>
      <div className="flex flex-col gap-3">
        <input
          placeholder="e.g. STRIPE_API_KEY"
          className="p-2 border rounded text-sm"
          value={keyName}
          onChange={e => setKeyName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Value"
          className="p-2 border rounded text-sm"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <button
          onClick={handleSave}
          className="bg-indigo-600 text-white py-2 rounded text-sm font-medium hover:bg-indigo-700"
        >
          Encrypt & Save to Vault
        </button>
      </div>
    </div>
  )
}
