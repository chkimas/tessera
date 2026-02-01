import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-indigo-600 text-white shadow-sm',
        secondary: 'bg-slate-100 text-slate-700',
        outline: 'border border-slate-200 text-slate-700 bg-white',
        ghost: 'text-slate-600',
        success:
          'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-sm shadow-emerald-500/20',
        warning:
          'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-sm shadow-amber-500/20',
        error: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm shadow-red-500/20',
        info: 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-sm shadow-blue-500/20',
        disabled: 'bg-slate-300 text-slate-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
