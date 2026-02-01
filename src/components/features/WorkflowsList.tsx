'use client'

import { useState } from 'react'
import Link from 'next/link'
import DeploymentButton from '@/components/features/DeploymentButton'
import { Zap, Search, Filter } from 'lucide-react'
import { StatusBadge } from '@/components/tessera'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Workflow {
  id: string
  name: string
  status: string
  updatedAt: Date
}

interface WorkflowsListProps {
  orgId: string
  workflows: Workflow[]
}

const statusColorMap = {
  draft: 'from-blue-500 to-sky-500',
  approved: 'from-amber-400 to-amber-600',
  deployed: 'from-emerald-400 to-emerald-600',
  paused: 'from-slate-300 to-slate-400',
}

export default function WorkflowsList({ orgId, workflows }: WorkflowsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredWorkflows = workflows.filter(wf => {
    const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || wf.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Status:</span>
            {['all', 'draft', 'approved', 'deployed', 'paused'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredWorkflows.length > 0 ? (
          filteredWorkflows.map(wf => (
            <div
              key={wf.id}
              className="group relative overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all rounded"
            >
              <div
                className={`absolute inset-y-0 left-0 w-1 bg-linear-to-b ${
                  statusColorMap[wf.status as keyof typeof statusColorMap] || statusColorMap.draft
                }`}
              />

              <div className="p-5 pl-6 flex justify-between items-center">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="h-10 w-10 bg-slate-50 rounded flex items-center justify-center group-hover:bg-indigo-50 transition-colors shrink-0">
                    <Zap className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{wf.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <StatusBadge status={wf.status} />
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        Updated {new Date(wf.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/${orgId}/workflows/${wf.id}`}>View</Link>
                  </Button>
                  <DeploymentButton workflowId={wf.id} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 py-20 text-center rounded">
            <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {searchQuery || statusFilter !== 'all' ? 'No workflows found' : 'No workflows yet'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first workflow or start from a template'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button size="sm" asChild>
                <Link href={`/dashboard/${orgId}`}>Browse Templates</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
