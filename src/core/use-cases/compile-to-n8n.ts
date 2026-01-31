import { WorkflowSpecification, WorkflowNode } from '@/core/domain/specification'

type N8nConnections = Record<
  string,
  {
    main: Array<
      Array<{
        node: string
        type: 'main'
        index: number
      }>
    >
  }
>

function mapNodeToN8n(node: WorkflowNode) {
  const n8nType = node.type === 'TRIGGER' ? 'n8n-nodes-base.webhook' : 'n8n-nodes-base.httpRequest'

  return {
    id: node.id,
    name: node.name,
    type: n8nType,
    typeVersion: 1,
    position: [node.position.x, node.position.y],
  }
}

export function compileSpecToN8n(spec: WorkflowSpecification, workflowId: string) {
  const n8nNodes = spec.nodes.map(node => {
    const base = mapNodeToN8n(node)
    return {
      ...base,
      parameters: {
        ...node.data,
        onCompleteCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/workflows/execution`,
        tesseraId: workflowId,
      },
    }
  })

  const n8nConnections = spec.edges.reduce<N8nConnections>((acc, edge) => {
    const sourceNodeName = spec.nodes.find(n => n.id === edge.source)?.name
    const targetNodeName = spec.nodes.find(n => n.id === edge.target)?.name

    if (!sourceNodeName || !targetNodeName) return acc

    acc[sourceNodeName] = {
      main: [[{ node: targetNodeName, type: 'main', index: 0 }]],
    }
    return acc
  }, {})

  return {
    nodes: n8nNodes,
    connections: n8nConnections,
    settings: { executionOrder: 'v1' },
    staticData: null,
    meta: { instanceId: 'tessera-control-plane' },
  }
}
