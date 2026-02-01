'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { OrganizationSwitcher, UserButton, useUser } from '@clerk/nextjs'
import { LayoutDashboard, Zap, ShieldCheck, CreditCard, Activity, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useUser()

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-linear-to-b from-slate-900 via-slate-900 to-slate-800 text-slate-300 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
        {!isCollapsed ? (
          <>
            <span className="text-xl font-black tracking-tight text-white font-display">
              TESSERA
              <span className="text-transparent bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text">
                .
              </span>
            </span>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex items-center justify-center text-2xl font-black cursor-w-resize text-transparent bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text hover:from-indigo-300 hover:to-violet-300 transition-all"
          >
            T
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="p-4 border-b border-white/10">
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: 'w-full',
                organizationSwitcherTrigger:
                  'w-full bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors py-2 px-3 border border-slate-700',
              },
            }}
            hidePersonal
            afterCreateOrganizationUrl="/dashboard/:id"
            afterSelectOrganizationUrl="/dashboard/:id"
          />
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main Navigation">
        {navigation.map(item => {
          const fullHref = `${basePath}${item.href}`
          const isActive = pathname === fullHref || (item.href === '' && pathname === basePath)

          return (
            <Link
              key={item.name}
              href={fullHref}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'group flex items-center px-3 py-3 text-sm font-bold transition-colors',
                isActive
                  ? 'text-transparent bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text'
                  : 'text-slate-400 hover:text-white',
                isCollapsed && 'justify-center'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300',
                  !isCollapsed && 'mr-3'
                )}
              />
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>

      <footer className="border-t border-white/10">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 px-4 py-3">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: 'w-8 h-8',
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-3">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: 'w-8 h-8',
                },
              }}
            />
          </div>
        )}
      </footer>
    </aside>
  )
}
