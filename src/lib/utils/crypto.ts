// AES-256-GCM encryption for sensitive settings (API keys, secrets)
// Encryption key derived from SUPABASE_SERVICE_ROLE_KEY — never stored separately

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // GCM standard

async function deriveKey(): Promise<CryptoKey> {
  const keyMaterial = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-dev-key-not-for-production'
  const encoder = new TextEncoder()
  const rawKey = encoder.encode(keyMaterial.slice(0, 32).padEnd(32, '0'))

  return crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt a string value with AES-256-GCM
 * Returns: base64(iv + ciphertext)
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await deriveKey()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoded = new TextEncoder().encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  )

  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  return Buffer.from(combined).toString('base64')
}

/**
 * Decrypt a base64-encoded encrypted string
 */
export async function decrypt(encryptedBase64: string): Promise<string> {
  const key = await deriveKey()
  const combined = Buffer.from(encryptedBase64, 'base64')

  const iv = combined.slice(0, IV_LENGTH)
  const ciphertext = combined.slice(IV_LENGTH)

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  )

  return new TextDecoder().decode(plaintext)
}
