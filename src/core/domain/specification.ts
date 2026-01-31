export type NodeType = 'TRIGGER' | 'ACTION' | 'TRANSFORM'

export type TriggerSource =
  | { type: 'WEBHOOK'; path: string; method: 'GET' | 'POST' }
  | { type: 'SCHEDULE'; cron: string }
  | { type: 'EVENT'; topic: string }

export type ActionTarget =
  | { type: 'HTTP_REQUEST'; url: string; method: string }
  | { type: 'DATABASE_UPSERT'; table: string }
  | { type: 'N8N_WORKFLOW'; workflowId: string }

export interface WorkflowNode {
  id: string
  name: string
  type: NodeType
  // Based on the type, only specific configurations are valid
  data: TriggerSource | ActionTarget | Record<string, unknown>
  position: { x: number; y: number }
}

export interface WorkflowEdge {
  id: string
  source: string // ID of the origin node
  target: string // ID of the destination node
}

export interface WorkflowSpecification {
  version: '1.0.0'
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  metadata: {
    expectedTimeout: number // in seconds
    retries: number
  }
}
