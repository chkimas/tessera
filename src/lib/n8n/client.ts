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
      const response = await fetch(`${N8N_API_URL}/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          ...compiledData,
          active: true,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error('n8n deployment failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
          workflowName: name,
        })
        throw new Error(`n8n Deployment Failed [${response.status}]: ${errorBody}`)
      }

      return response.json() as Promise<N8nDeploymentResponse>
    })
  },
}
