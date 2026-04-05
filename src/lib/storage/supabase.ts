import { createAdminClient } from '@/src/lib/supabase/admin'
import type { StorageProvider } from './index'

export class SupabaseStorageProvider implements StorageProvider {
  private publicBucket = 'listings'
  private privateBucket = 'kyc-documents'

  private getClient() {
    return createAdminClient()
  }

  private getBucket(path: string): string {
    // KYC documents go to private bucket
    if (path.startsWith('kyc/') || path.startsWith('documents/')) {
      return this.privateBucket
    }
    return this.publicBucket
  }

  async upload(path: string, file: Buffer | Blob, contentType: string): Promise<{ url: string }> {
    const supabase = this.getClient()
    const bucket = this.getBucket(path)

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
        cacheControl: '3600',
      })

    if (error) throw new Error(`Upload failed: ${error.message}`)

    if (bucket === this.publicBucket) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return { url: data.publicUrl }
    }

    // Private bucket — return the path, caller must get signed URL
    return { url: path }
  }

  async download(path: string): Promise<Buffer> {
    const supabase = this.getClient()
    const bucket = this.getBucket(path)

    const { data, error } = await supabase.storage.from(bucket).download(path)
    if (error || !data) throw new Error(`Download failed: ${error?.message}`)

    return Buffer.from(await data.arrayBuffer())
  }

  async delete(path: string): Promise<void> {
    const supabase = this.getClient()
    const bucket = this.getBucket(path)

    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw new Error(`Delete failed: ${error.message}`)
  }

  async getSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
    const supabase = this.getClient()
    const bucket = this.getBucket(path)

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds)

    if (error || !data) throw new Error(`Signed URL failed: ${error?.message}`)
    return data.signedUrl
  }

  async listFiles(prefix: string): Promise<string[]> {
    const supabase = this.getClient()
    const bucket = this.getBucket(prefix)

    const { data, error } = await supabase.storage.from(bucket).list(prefix)
    if (error) throw new Error(`List failed: ${error.message}`)

    return (data || []).map((f) => `${prefix}/${f.name}`)
  }
}
