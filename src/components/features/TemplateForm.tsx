'use client'

import { useState } from 'react'
import { createFromTemplateAction } from '@/actions/template-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface TemplateFormProps {
  templateId: string
  orgId: string
  parameters: Array<{ key: string; label: string; type: 'text' | 'secret'; required: boolean }>
}

export default function TemplateForm({ templateId, orgId, parameters }: TemplateFormProps) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleDeploy = async () => {
    setLoading(true)
    try {
      await createFromTemplateAction(orgId, templateId, values)
      setOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Deploy Template</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {templateId.replace(/-/g, ' ').toUpperCase()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {parameters.map(param => (
            <div key={param.key} className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {param.label}
              </span>
              <Input
                type={param.type}
                placeholder={param.label}
                value={values[param.key] || ''}
                onChange={e => setValues({ ...values, [param.key]: e.target.value })}
                required={param.required}
              />
            </div>
          ))}
        </div>
        <Button onClick={handleDeploy} className="w-full" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {loading ? 'Deploying...' : 'Deploy to n8n'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
