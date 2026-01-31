'use client'

import { useState } from 'react'
import { deployWorkflowAction } from '@/actions/workflow-actions'
import { WorkflowSpecification } from '@/core/domain/specification'

interface Props {
  workflowId: string
  specification: WorkflowSpecification
}

export default function DeploymentButton({ workflowId, specification }: Props) {
  const [isPending, setIsPending] = useState(false)

  async function handleDeploy() {
    setIsPending(true)
    const result = await deployWorkflowAction(workflowId, specification)

    if (result.success) {
      alert('Workflow deployed to n8n successfully.')
    } else {
      alert('Deployment failed. Check server logs.')
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
