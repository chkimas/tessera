'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { OrganizationSwitcher } from '@clerk/nextjs'
import { LayoutDashboard, Zap, ShieldCheck, CreditCard, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  orgId: string
}

export default function Sidebar({ orgId }: SidebarProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: `/dashboard/${orgId}`, icon: LayoutDashboard },
    { name: 'Workflows', href: `/dashboard/${orgId}/workflows`, icon: Zap },
    { name: 'Security Vault', href: `/dashboard/${orgId}/vault`, icon: ShieldCheck },
    { name: 'Activity', href: `/dashboard/${orgId}/activity`, icon: Activity },
    { name: 'Billing', href: `/dashboard/${orgId}/billing`, icon: CreditCard },
  ]

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <span className="text-xl font-bold bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          TESSERA
        </span>
      </div>

      <div className="p-4 border-b border-slate-800">
        <OrganizationSwitcher
          appearance={{
            elements: {
              rootBox: 'w-full',
              organizationSwitcherTrigger:
                'w-full bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors py-2 px-3 rounded-lg border border-slate-700',
            },
          }}
          hidePersonal
          afterCreateOrganizationUrl="/dashboard/:id"
          afterSelectOrganizationUrl="/dashboard/:id"
        />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all',
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                  : 'hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 shrink-0',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-3 mb-2">
          System Status
        </div>
        <div className="flex items-center px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-3" />
          <span className="text-xs font-medium text-emerald-400">Control Plane: Online</span>
        </div>
      </div>
    </div>
  )
}
