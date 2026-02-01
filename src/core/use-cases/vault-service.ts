import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16

const MASTER_KEY = scryptSync(process.env.ENCRYPTION_KEY as string, 'salt', 32)

export const VaultService = {
  encrypt(text: string): { content: string; iv: string; tag: string } {
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(ALGORITHM, MASTER_KEY, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return {
      content: encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
    }
  },

  decrypt(content: string, ivHex: string, tagHex: string): string {
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')

    if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) {
      throw new Error('Invalid vault parameters: integrity check failed')
    }

    const decipher = createDecipheriv(ALGORITHM, MASTER_KEY, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(content, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  },
}
