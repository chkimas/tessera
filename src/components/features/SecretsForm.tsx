'use client'

import { useState } from 'react'
import { createSecretAction } from '@/actions/secret-actions'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
      setMessage('✓ Stored securely')
      e.currentTarget.reset()
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(`✗ ${result.error}`)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="keyName"
        placeholder="Key name (e.g., SLACK_BOT_TOKEN)"
        required
        className="font-mono"
      />
      <Input name="secretValue" type="password" placeholder="Secret value" required />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Store Secret'}
      </Button>
      {message && (
        <p
          className={`text-xs font-bold text-center ${message.includes('✗') ? 'text-red-600' : 'text-emerald-600'}`}
        >
          {message}
        </p>
      )}
    </form>
  )
}
