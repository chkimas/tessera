'use server'

import { db } from '@/lib/db'
import { secrets } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { VaultService } from '@/core/use-cases/vault-service'
import { revalidatePath } from 'next/cache'

interface SecretResponse {
  success: boolean
  error?: string
}

export async function createSecretAction(
  keyName: string,
  rawValue: string
): Promise<SecretResponse> {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) throw new Error('Unauthorized')

    const existing = await db.query.secrets.findFirst({
      where: and(eq(secrets.orgId, orgId), eq(secrets.keyName, keyName)),
    })

    if (existing) throw new Error(`Secret "${keyName}" already exists for this organization`)

    const encrypted = VaultService.encrypt(rawValue)

    await db.insert(secrets).values({
      orgId,
      keyName,
      encryptedValue: encrypted.content,
      iv: encrypted.iv,
      tag: encrypted.tag,
    })

    revalidatePath(`/dashboard/${orgId}`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create secret',
    }
  }
}

export async function deleteSecretAction(secretId: string): Promise<SecretResponse> {
  try {
    const { orgId } = await auth()
    if (!orgId) throw new Error('Unauthorized')

    const result = await db
      .delete(secrets)
      .where(and(eq(secrets.id, secretId), eq(secrets.orgId, orgId)))
      .returning()

    if (result.length === 0) throw new Error('Secret not found or access denied')

    revalidatePath(`/dashboard/${orgId}`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete secret',
    }
  }
}
