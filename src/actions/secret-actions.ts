'use server'

import { db } from '@/lib/db'
import { secrets } from '@/lib/db/schema'
import { VaultService } from '@/core/use-cases/vault-service'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateSecretSchema = z.object({
  orgId: z.string().uuid(),
  keyName: z.string().min(1).max(255),
  secretValue: z.string().min(1),
})

export async function createSecretAction(formData: unknown) {
  try {
    const { orgId, keyName, secretValue } = CreateSecretSchema.parse(formData)

    const { content, iv, tag } = VaultService.encrypt(secretValue)

    await db.insert(secrets).values({
      orgId,
      keyName,
      encryptedValue: content,
      iv,
      tag,
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to create secret:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database error',
    }
  }
}
