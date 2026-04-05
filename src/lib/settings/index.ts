// Platform Settings — reads from DB, not from env vars
// All integrations (Razorpay, WhatsApp, etc.) configured by admin via UI

import { createAdminClient } from '@/src/lib/supabase/admin'

interface Setting {
  key: string
  value: string | null
  is_sensitive: boolean
  is_configured: boolean
  label: string
  category: string
}

// In-memory cache: key → { value, expiresAt }
const cache = new Map<string, { value: string | null; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Get a single setting value by key.
 * Sensitive values are decrypted on the server.
 * Returns null if not configured.
 */
export async function getSetting(key: string): Promise<string | null> {
  // Check cache first
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('platform_settings')
    .select('value, is_sensitive, is_configured')
    .eq('key', key)
    .single()

  if (error || !data || !data.is_configured) {
    cache.set(key, { value: null, expiresAt: Date.now() + CACHE_TTL_MS })
    return null
  }

  // Decrypt sensitive values
  let value = data.value
  if (data.is_sensitive && value && value.startsWith('enc:')) {
    const { decrypt } = await import('@/src/lib/utils/crypto')
    value = await decrypt(value.slice(4))
  }

  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
  return value
}

/**
 * Save a setting value. Encrypts if is_sensitive.
 * Clears cache for that key immediately.
 */
export async function setSetting(
  key: string,
  value: string,
  adminId?: string
): Promise<void> {
  const supabase = createAdminClient()

  // Check if this setting is sensitive
  const { data: existing } = await supabase
    .from('platform_settings')
    .select('is_sensitive')
    .eq('key', key)
    .single()

  let storedValue = value
  if (existing?.is_sensitive) {
    const { encrypt } = await import('@/src/lib/utils/crypto')
    storedValue = 'enc:' + (await encrypt(value))
  }

  await supabase
    .from('platform_settings')
    .update({
      value: storedValue,
      is_configured: true,
      last_updated_at: new Date().toISOString(),
      updated_by: adminId,
    })
    .eq('key', key)

  // Log admin activity
  if (adminId) {
    await supabase.from('admin_activity_log').insert({
      admin_id: adminId,
      action: 'setting_updated',
      entity_type: 'platform_settings',
      new_value: { key, configured: true },
    })
  }

  // Clear cache
  cache.delete(key)
}

/**
 * Check if all required settings for a category are configured.
 */
export async function isConfigured(category: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('platform_settings')
    .select('is_configured')
    .eq('category', category)

  if (!data || data.length === 0) return false
  return data.every((s) => s.is_configured)
}

/**
 * Get all settings for a category.
 * Sensitive values returned as masked ('••••••••').
 */
export async function getAllForCategory(category: string): Promise<Setting[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('platform_settings')
    .select('key, value, is_sensitive, is_configured, label, category')
    .eq('category', category)
    .order('key')

  return (data || []).map((s) => ({
    ...s,
    value: s.is_sensitive && s.value ? '••••••••' : s.value,
  }))
}

/** Invalidate a specific cached key */
export function invalidateCache(key: string): void {
  cache.delete(key)
}

/** Invalidate entire cache */
export function invalidateAllCache(): void {
  cache.clear()
}
