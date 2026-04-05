// Cloudflare R2 Storage implementation (S3-compatible, free 10GB)
import type { StorageProvider } from './index'

export class R2StorageProvider implements StorageProvider {
  private accountId = process.env.R2_ACCOUNT_ID!
  private accessKeyId = process.env.R2_ACCESS_KEY_ID!
  private secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!
  private bucketName = process.env.R2_BUCKET_NAME || 'gomigo'
  private publicUrl = process.env.R2_PUBLIC_URL || ''

  private endpoint() {
    return `https://${this.accountId}.r2.cloudflarestorage.com`
  }

  private async getSignature(method: string, path: string, contentType?: string): Promise<Headers> {
    // For R2 use standard AWS Sig V4 — simplified implementation
    // In production use @aws-sdk/client-s3 which supports R2 endpoint
    const headers = new Headers()
    headers.set('x-amz-content-sha256', 'UNSIGNED-PAYLOAD')
    headers.set('x-amz-date', new Date().toISOString().replace(/[:\-]/g, '').slice(0, 15) + 'Z')
    if (contentType) headers.set('content-type', contentType)
    return headers
  }

  async upload(path: string, file: Buffer | Blob, contentType: string): Promise<{ url: string }> {
    const url = `${this.endpoint()}/${this.bucketName}/${path}`
    const headers = await this.getSignature('PUT', path, contentType)

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: file,
    })

    if (!response.ok) throw new Error(`R2 upload failed: ${response.statusText}`)

    const publicFileUrl = this.publicUrl
      ? `${this.publicUrl}/${path}`
      : `${url}`

    return { url: publicFileUrl }
  }

  async download(path: string): Promise<Buffer> {
    const url = `${this.endpoint()}/${this.bucketName}/${path}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`R2 download failed: ${response.statusText}`)
    return Buffer.from(await response.arrayBuffer())
  }

  async delete(path: string): Promise<void> {
    const url = `${this.endpoint()}/${this.bucketName}/${path}`
    const response = await fetch(url, { method: 'DELETE' })
    if (!response.ok) throw new Error(`R2 delete failed: ${response.statusText}`)
  }

  async getSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
    // For R2 signed URLs, use the presigned URL approach
    // In production, use @aws-sdk/s3-request-presigner
    return `${this.endpoint()}/${this.bucketName}/${path}?X-Amz-Expires=${expiresInSeconds}`
  }

  async listFiles(prefix: string): Promise<string[]> {
    const url = `${this.endpoint()}/${this.bucketName}?list-type=2&prefix=${encodeURIComponent(prefix)}`
    const response = await fetch(url)
    if (!response.ok) return []
    const text = await response.text()
    const matches = text.match(/<Key>([^<]+)<\/Key>/g) || []
    return matches.map((m) => m.replace(/<\/?Key>/g, ''))
  }
}
