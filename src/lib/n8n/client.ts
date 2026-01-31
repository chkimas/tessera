interface CompiledWorkflowData {
  nodes: unknown[]
  connections: Record<string, unknown>
  settings: { executionTimeout: number }
  staticData: null
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

export const n8nClient = {
  async deployWorkflow(
    name: string,
    compiledData: CompiledWorkflowData
  ): Promise<N8nDeploymentResponse> {
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
      throw new Error(`n8n Deployment Failed: ${response.statusText}`)
    }

    return response.json() as Promise<N8nDeploymentResponse>
  },
}
