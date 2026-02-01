'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { OrganizationSwitcher } from '@clerk/nextjs'
import { LayoutDashboard, Zap, ShieldCheck, CreditCard, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  orgId: string
}

const navigation = [
  { name: 'Dashboard', href: '', icon: LayoutDashboard },
  { name: 'Workflows', href: '/workflows', icon: Zap },
  { name: 'Security Vault', href: '/vault', icon: ShieldCheck },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Billing', href: '/billing', icon: CreditCard },
]

export default function Sidebar({ orgId }: SidebarProps) {
  const pathname = usePathname()
  const basePath = `/dashboard/${orgId}`

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <span className="text-xl font-black tracking-tighter text-white">
          TESSERA<span className="text-indigo-500">.</span>
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

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main Navigation">
        {navigation.map(item => {
          const fullHref = `${basePath}${item.href}`
          const isActive = pathname === fullHref || (item.href === '' && pathname === basePath)

          return (
            <Link
              key={item.name}
              href={fullHref}
              className={cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 shrink-0',
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <footer className="p-4 border-t border-slate-800">
        <div className="flex items-center px-3 py-2.5 bg-slate-950/50 rounded-xl border border-slate-800">
          <div className="relative flex h-2 w-2 mr-3">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <div className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            System Operational
          </span>
        </div>
      </footer>
    </aside>
  )
}
