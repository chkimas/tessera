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
    <ClerkProvider>
      <html lang="en">
        <body className={`${satoshi.variable} ${cabinetGrotesk.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
