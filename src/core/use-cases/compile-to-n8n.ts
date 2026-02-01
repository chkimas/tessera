import { WorkflowSpecification } from '@/core/domain/specification'

type N8nConnectionEntry = {
  main: Array<Array<{ node: string; type: 'main'; index: number }>>
}

export function compileSpecToN8n(spec: WorkflowSpecification, workflowId: string) {
  const nodeMap = new Map(spec.nodes.map(n => [n.id, n.name]))

  const nodes = spec.nodes.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type === 'TRIGGER' ? 'n8n-nodes-base.webhook' : 'n8n-nodes-base.httpRequest',
    position: [node.position.x, node.position.y],
    parameters: {
      ...node.data,
      tesseraId: workflowId,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/workflows/execution?id=${workflowId}`,
    },
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
