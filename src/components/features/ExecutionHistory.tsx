import { useState } from 'react'
import { Eye } from 'lucide-react'
import ExecutionDetailModal from '@/components/features/ExecutionDetailModal'

export interface LogMetadata {
  n8nId?: string
  error?: string
  payloadSize?: number
  ipAddress?: string
}

export interface LogEntry {
  id: string
  action: string
  workflowId: string | null
  timestamp: Date | null
  metadata: LogMetadata
}

export function ExecutionHistory({ logs }: { logs: LogEntry[] }) {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {logs.map(log => (
          <div
            key={log.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-100 group"
          >
            <div className="flex items-center gap-4">
              <div
                className={`h-2 w-2 rounded-full ${log.action.includes('ERROR') ? 'bg-red-500' : 'bg-emerald-500'}`}
              />
              <div>
                <p className="text-sm font-semibold text-slate-700">{log.action}</p>
                <p className="text-[10px] text-slate-400 font-mono uppercase">
                  {log.id.slice(0, 8)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(log)}
              className="flex items-center gap-2 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-700"
            >
              <Eye className="h-3.5 w-3.5" /> View Details
            </button>
          </div>
        ))}
      </div>

      {selectedLog && (
        <ExecutionDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  )
}
