export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]

export type NodeType = 'TRIGGER' | 'ACTION' | 'TRANSFORM'

export type TriggerSource =
  | { type: 'WEBHOOK'; path: string; method: 'GET' | 'POST' }
  | { type: 'SCHEDULE'; cron: string }
  | { type: 'EVENT'; topic: string }

export type ActionTarget =
  | {
      type: 'HTTP_REQUEST';
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: JsonValue; 
      headers?: Record<string, string>;
    }
  | { type: 'DATABASE_UPSERT'; table: string }
  | { type: 'N8N_WORKFLOW'; workflowId: string };

export interface WorkflowNode {
  id: string
  name: string
  type: NodeType
  data: TriggerSource | ActionTarget | Record<string, unknown>
  position: { x: number; y: number }
}

export interface WorkflowEdge {
  // FIXED: was "Edge"
  id: string
  source: string
  target: string
}

export interface WorkflowMetadata {
  expectedTimeout: number
  retries: number
}

export interface WorkflowSpecification {
  version: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  metadata: WorkflowMetadata
  parameters?: Array<{
    key: string
    label: string
    type: 'text' | 'secret'
    required: boolean
  }>
}
