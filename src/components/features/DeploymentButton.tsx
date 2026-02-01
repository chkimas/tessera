'use client'

import { useState } from 'react'
import { deployWorkflowAction } from '@/actions/workflow-actions'

interface Props {
  workflowId: string
}

export default function DeploymentButton({ workflowId }: Props) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleDeploy() {
    setStatus('pending')
    setErrorMessage('')

    const result = await deployWorkflowAction(workflowId)

    if (result.success) {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
      setErrorMessage(result.error || 'Deployment failed')
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleDeploy}
        disabled={status === 'pending'}
        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors focus:ring-2 focus:ring-slate-400 focus:outline-none"
        aria-busy={status === 'pending'}
      >
        {status === 'pending' ? 'Pushing...' : 'Push to n8n'}
      </button>

      {status === 'success' && (
        <span className="text-xs text-emerald-600 font-medium animate-in fade-in slide-in-from-top-1">
          Successfully deployed
        </span>
      )}

      {status === 'error' && (
        <span className="text-xs text-rose-600 font-medium animate-in fade-in slide-in-from-top-1">
          {errorMessage}
        </span>
      )}
    </div>
  )
}
