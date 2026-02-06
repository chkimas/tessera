interface CompiledWorkflowData {
  nodes: unknown[]
  connections: Record<string, unknown>
  settings: { executionTimeout: number }
  staticData: Record<string, string> | null
  meta: { instanceId: string }
}

interface N8nDeploymentResponse {
  id: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

interface N8nWorkflow {
  id: string
  nodes: Array<{
    type: string
    parameters: { path?: string }
  }>
}

const N8N_API_URL = process.env.N8N_API_URL || 'http://localhost:5678/api/v1'
const N8N_API_KEY = process.env.N8N_API_KEY

async function retryRequest<T>(
  fn: () => Promise<T>,
  retries: number = 2,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error
    await new Promise(resolve => setTimeout(resolve, delay))
    return retryRequest(fn, retries - 1, delay * 2)
  }
}

export const n8nClient = {
  async deployWorkflow(
    name: string,
    compiledData: CompiledWorkflowData
  ): Promise<N8nDeploymentResponse> {
    return retryRequest(async () => {
      const { nodes, connections, settings } = compiledData
      const response = await fetch(`${N8N_API_URL}/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, nodes, connections, settings }),
      })
      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`n8n Creation Failed [${response.status}]: ${errorBody}`)
      }
      return response.json()
    })
  },

  async activateWorkflow(workflowId: string): Promise<void> {
    return retryRequest(async () => {
      const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}/activate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY || '',
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`n8n Activation Failed [${response.status}]: ${errorBody}`)
      }
    })
  },

  async deleteWorkflow(workflowId: string): Promise<void> {
    return retryRequest(async () => {
      const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY || '',
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok && response.status !== 404) {
        const errorBody = await response.text()
        throw new Error(`n8n Deletion Failed [${response.status}]: ${errorBody}`)
      }
    })
  },

  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return retryRequest(async () => {
      const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}`, {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY || '' },
      })
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
      return response.json()
    })
  },

  async deactivateWorkflow(workflowId: string): Promise<void> {
    return retryRequest(async () => {
      const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}/deactivate`, {
        method: 'POST',
        headers: { 'X-N8N-API-KEY': N8N_API_KEY || '' },
      })
      if (!response.ok) throw new Error(`Deactivate failed: ${response.status}`)
    })
  },
}
