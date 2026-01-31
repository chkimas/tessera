import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY as string, 'hex')

export const VaultService = {
  encrypt(text: string): { content: string; iv: string; tag: string } {
    const iv = randomBytes(12)
    const cipher = createCipheriv(ALGORITHM, KEY, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return {
      content: encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
    }
  },

  decrypt(content: string, iv: string, tag: string): string {
    const decipher = createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, 'hex'))
    decipher.setAuthTag(Buffer.from(tag, 'hex'))

    let decrypted = decipher.update(content, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  },
}
