// Storage abstraction layer — switch providers via STORAGE_PROVIDER env var

export interface StorageProvider {
  upload(path: string, file: Buffer | Blob, contentType: string): Promise<{ url: string }>
  download(path: string): Promise<Buffer>
  delete(path: string): Promise<void>
  getSignedUrl(path: string, expiresInSeconds: number): Promise<string>
  listFiles(prefix: string): Promise<string[]>
}

let _storage: StorageProvider | null = null

export async function getStorage(): Promise<StorageProvider> {
  if (_storage) return _storage

  const provider = process.env.STORAGE_PROVIDER || 'supabase'

  switch (provider) {
    case 'supabase': {
      const { SupabaseStorageProvider } = await import('./supabase')
      _storage = new SupabaseStorageProvider()
      break
    }
    case 'r2': {
      const { R2StorageProvider } = await import('./r2')
      _storage = new R2StorageProvider()
      break
    }
    case 's3': {
      const { S3StorageProvider } = await import('./s3')
      _storage = new S3StorageProvider()
      break
    }
    default:
      throw new Error(`Unknown storage provider: ${provider}`)
  }

  return _storage
}

export async function upload(path: string, file: Buffer | Blob, contentType: string) {
  const storage = await getStorage()
  return storage.upload(path, file, contentType)
}

export async function getSignedUrl(path: string, expiresInSeconds = 3600) {
  const storage = await getStorage()
  return storage.getSignedUrl(path, expiresInSeconds)
}
