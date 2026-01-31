import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { secrets } from '@/lib/db/schema'
import { VaultService } from '@/core/use-cases/vault-service'

export async function POST(req: NextRequest) {
  try {
    const { orgId, keyName, value } = await req.json()

    const { content, iv, tag } = VaultService.encrypt(value)

    await db.insert(secrets).values({
      orgId,
      keyName,
      encryptedValue: content,
      iv,
      tag,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to store secret' }, { status: 500 })
  }
}
