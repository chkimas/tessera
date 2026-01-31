interface SecretMeta {
  id: string
  keyName: string
}

export default function SecretsList({ secrets }: { secrets: SecretMeta[] }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vault Status</h3>
        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
          AES-256
        </span>
      </div>

      <ul className="space-y-2">
        {secrets.map(s => (
          <li
            key={s.id}
            className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 shadow-sm"
          >
            <span className="text-xs font-mono text-slate-600">{s.keyName}</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-medium italic">Encrypted</span>
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>
          </li>
        ))}

        {secrets.length === 0 && (
          <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-[10px] text-slate-400">Vault is currently empty.</p>
          </div>
        )}
      </ul>
    </div>
  )
}
