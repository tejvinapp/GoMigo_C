// AWS S3 Storage implementation
import type { StorageProvider } from './index'

export class S3StorageProvider implements StorageProvider {
  private region = process.env.AWS_REGION || 'ap-south-1'
  private bucket = process.env.AWS_S3_BUCKET || 'gomigo'
  private accessKey = process.env.AWS_ACCESS_KEY_ID!
  private secretKey = process.env.AWS_SECRET_ACCESS_KEY!

  private endpoint() {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com`
  }

  async upload(path: string, file: Buffer | Blob, contentType: string): Promise<{ url: string }> {
    // In production: use @aws-sdk/client-s3 PutObjectCommand
    const url = `${this.endpoint()}/${path}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    })
    if (!response.ok) throw new Error(`S3 upload failed: ${response.statusText}`)
    return { url }
  }

  async download(path: string): Promise<Buffer> {
    const url = `${this.endpoint()}/${path}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`S3 download failed: ${response.statusText}`)
    return Buffer.from(await response.arrayBuffer())
  }

  async delete(path: string): Promise<void> {
    const url = `${this.endpoint()}/${path}`
    const response = await fetch(url, { method: 'DELETE' })
    if (!response.ok) throw new Error(`S3 delete failed: ${response.statusText}`)
  }

  async getSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
    // In production: use @aws-sdk/s3-request-presigner getSignedUrl
    return `${this.endpoint()}/${path}?X-Amz-Expires=${expiresInSeconds}`
  }

  async listFiles(prefix: string): Promise<string[]> {
    const url = `${this.endpoint()}?list-type=2&prefix=${encodeURIComponent(prefix)}`
    const response = await fetch(url)
    if (!response.ok) return []
    const text = await response.text()
    const matches = text.match(/<Key>([^<]+)<\/Key>/g) || []
    return matches.map((m) => m.replace(/<\/?Key>/g, ''))
  }
}
