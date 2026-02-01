import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-all disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none',
        destructive:
          'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-rose-600 active:from-red-700 active:to-rose-700 disabled:from-red-200 disabled:to-rose-200 disabled:text-red-400',
        outline:
          'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200',
        secondary:
          'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 disabled:bg-slate-50 disabled:text-slate-400',
        ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-400',
        link: 'text-indigo-600 hover:text-indigo-700 hover:underline active:text-indigo-800 disabled:text-slate-400',
        success:
          'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700',
        warning:
          'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700',
      },
      size: {
        default: 'h-10 px-4 py-2.5 has-[>svg]:px-3',
        xs: "h-8 gap-1 px-2 has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-9 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-12 px-6 has-[>svg]:px-4',
        icon: 'size-10',
        'icon-xs': "size-8 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
