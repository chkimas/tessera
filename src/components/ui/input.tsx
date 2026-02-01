import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-slate-400 selection:bg-indigo-600 selection:text-white h-10 w-full min-w-0 bg-slate-50 border-transparent px-4 py-3 text-sm text-slate-900 font-medium shadow-inner transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-100',
        'focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
        'aria-invalid:bg-red-50 aria-invalid:ring-2 aria-invalid:ring-red-500/50 aria-invalid:border-red-500',
        className
      )}
      {...props}
    />
  )
}

export { Input }
