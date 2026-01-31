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
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          System Activity Log
        </h3>
      </div>
      <div className="divide-y divide-slate-100">
        {logs.map(log => (
          <div
            key={log.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  log.action.includes('DEPLOYED') ? 'bg-indigo-500' : 'bg-emerald-500'
                }`}
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {log.action.replace('_', ' ')}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Target: {log.workflowId?.slice(0, 8) || 'System'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}
              </p>
              <p className="text-[10px] text-slate-400">
                {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : ''}
              </p>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="p-10 text-center text-slate-400 text-sm italic">
            No execution history found.
          </div>
        )}
      </div>
    </div>
  )
}
