import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits standard for GCM

/**
 * Derives a standard 32-byte (256-bit) buffer key from the environment variable
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.GMAIL_TOKEN_ENCRYPTION_KEY

  if (!secret) {
    throw new Error(
      'GMAIL_TOKEN_ENCRYPTION_KEY belum dikonfigurasi di environment variables. Kunci ini wajib untuk mengenkripsi token OAuth.'
    )
  }

  // If provided as a 64-character hex string (32 bytes), parse directly
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, 'hex')
  }

  // Otherwise derive a deterministic 32-byte key via SHA-256
  return crypto.createHash('sha256').update(secret, 'utf-8').digest()
}

export interface EncryptedPayload {
  iv: string
  tag: string
  encryptedData: string
}

/**
 * Encrypts plaintext string using AES-256-GCM authenticated encryption
 * Format: iv_hex:tag_hex:ciphertext_hex
 */
export function encryptToken(plainText: string): string {
  if (!plainText) {
    throw new Error('Teks yang akan dienkripsi tidak boleh kosong.')
  }

  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ])

  const tag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypts AES-256-GCM packed string
 */
export function decryptToken(packedString: string): string {
  if (!packedString) {
    throw new Error('Data terenkripsi tidak boleh kosong.')
  }

  const parts = packedString.split(':')
  if (parts.length !== 3) {
    throw new Error('Format data terenkripsi tidak valid.')
  }

  const [ivHex, tagHex, encryptedHex] = parts
  const key = getEncryptionKey()

  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

