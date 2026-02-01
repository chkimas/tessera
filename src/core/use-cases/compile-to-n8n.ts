import {
  WorkflowSpecification,
  WorkflowNode,
  TriggerSource,
  ActionTarget,
} from '@/core/domain/specification'

type N8nConnectionEntry = {
  main: Array<Array<{ node: string; type: 'main'; index: number }>>
}

function mapNodeToN8nType(node: WorkflowNode): string {
  if (node.type === 'TRIGGER') {
    const trigger = node.data as TriggerSource
    if (trigger.type === 'WEBHOOK') return 'n8n-nodes-base.webhook'
    if (trigger.type === 'SCHEDULE') return 'n8n-nodes-base.cron'
    if (trigger.type === 'EVENT') return 'n8n-nodes-base.webhook'
  }

  if (node.type === 'ACTION') {
    const action = node.data as ActionTarget
    if (action.type === 'HTTP_REQUEST') return 'n8n-nodes-base.httpRequest'
    if (action.type === 'DATABASE_UPSERT') return 'n8n-nodes-base.postgres'
    if (action.type === 'N8N_WORKFLOW') return 'n8n-nodes-base.executeWorkflow'
  }

  if (node.type === 'TRANSFORM') return 'n8n-nodes-base.code'

  return 'n8n-nodes-base.noOp'
}

function mapNodeParameters(node: WorkflowNode, workflowId: string): Record<string, unknown> {
  const baseParams = { tesseraId: workflowId }

  if (node.type === 'TRIGGER') {
    const trigger = node.data as TriggerSource
    if (trigger.type === 'WEBHOOK') {
      return {
        ...baseParams,
        path: trigger.path || workflowId,
        httpMethod: trigger.method || 'POST',
        responseMode: 'onReceived',
      }
    }
    if (trigger.type === 'SCHEDULE') {
      return { ...baseParams, cronExpression: trigger.cron }
    }
  }

  if (node.type === 'ACTION') {
    const action = node.data as ActionTarget

    if (action.type === 'HTTP_REQUEST') {
      return {
        ...baseParams,
        url: action.url,
        method: action.method,
        sendBody: !!action.body,
        specifyBody: action.body ? 'json' : undefined,
        jsonBody: action.body ? JSON.stringify(action.body) : undefined,
        headerParameters: action.headers
          ? {
              parameters: Object.entries(action.headers).map(([name, value]) => ({ name, value })),
            }
          : undefined,
      }
    }

    if (action.type === 'DATABASE_UPSERT') {
      return { ...baseParams, operation: 'upsert', table: action.table }
    }
  }

  return { ...baseParams, ...node.data }
}

export function compileSpecToN8n(spec: WorkflowSpecification, workflowId: string) {
  const nodeMap = new Map(spec.nodes.map(n => [n.id, n.name]))

  const nodes = spec.nodes.map(node => ({
    id: node.id,
    name: node.name,
    type: mapNodeToN8nType(node),
    typeVersion: 1,
    position: [node.position.x, node.position.y],
    parameters: mapNodeParameters(node, workflowId),
  }))

  const connections = spec.edges.reduce<Record<string, N8nConnectionEntry>>((acc, edge) => {
    const sourceName = nodeMap.get(edge.source)
    const targetName = nodeMap.get(edge.target)
    if (!sourceName || !targetName) return acc

    acc[sourceName] = {
      main: [[{ node: targetName, type: 'main', index: 0 }]],
    }
    return acc
  }, {})

  return {
    nodes,
    connections,
    settings: {
      executionOrder: 'v1',
      executionTimeout: spec.metadata.expectedTimeout || 300,
    },
    staticData: null,
    meta: { instanceId: 'tessera-control-plane' },
  }
}
