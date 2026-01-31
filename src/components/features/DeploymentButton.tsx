'use client'

import { useState } from 'react'
import { deployWorkflowAction } from '@/actions/workflow-actions'

interface Props {
  workflowId: string
}

export default function DeploymentButton({ workflowId }: Props) {
  const [isPending, setIsPending] = useState(false)

  async function handleDeploy() {
    setIsPending(true)

    const result = await deployWorkflowAction({
      workflowId,
      userId: '00000000-0000-0000-0000-000000000000',
      userRole: 'admin',
    })

    if (result.success) {
      alert('Workflow deployed to n8n successfully.')
    } else {
      alert(`Deployment failed: ${result.error}`)
    }

    setIsPending(false)
  }

  return (
    <button
      onClick={handleDeploy}
      disabled={isPending}
      className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
    >
      {isPending ? 'Deploying...' : 'Push to n8n'}
    </button>
  )
}
