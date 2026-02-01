import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const satoshi = localFont({
  src: '../fonts/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  display: 'swap',
})

const cabinetGrotesk = localFont({
  src: '../fonts/CabinetGrotesk-Variable.woff2',
  variable: '--font-cabinet',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tessera - Cloud Control Plane',
  description: 'Orchestration layer for n8n automation workflows',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#ffffff',
          colorInputBackground: '#f8fafc',
          colorInputText: '#0f172a',
          colorText: '#0f172a',
          colorTextSecondary: '#64748b',
          borderRadius: '0.5rem',
          fontFamily: 'var(--font-satoshi)',
        },
        elements: {
          card: 'bg-white border border-slate-200 shadow-sm',
          headerTitle: 'font-cabinet text-2xl tracking-tight text-slate-900',
          headerSubtitle: 'text-slate-500',
          formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 transition-colors text-white',
          footerActionLink: 'text-indigo-600 hover:text-indigo-700',
          identityPreviewText: 'text-slate-900',
          userButtonPopoverCard: 'border border-slate-200 shadow-xl',
        },
      }}
    >
      <html lang="en">
        <body
          className={`${satoshi.variable} ${cabinetGrotesk.variable} antialiased bg-white text-slate-950`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
