import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { upload } from '@/src/lib/storage/index'
import { AppError } from '@/src/lib/errors/AppError'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(new AppError('ERR_AUTH_SESSION_EXPIRED').toUserResponse(), { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const purpose = formData.get('purpose') as string || 'listing'
    const altText = formData.get('altText') as string || ''

    if (!file) {
      return NextResponse.json({ error: true, message: 'No file provided' }, { status: 400 })
    }

    // Size check (server-side, not just browser)
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        new AppError('ERR_UPLOAD_TOO_LARGE').toUserResponse('en'),
        { status: 413 }
      )
    }

    // Content type check (verify by reading magic bytes, not just extension)
    const buffer = Buffer.from(await file.arrayBuffer())
    const detectedType = detectMimeType(buffer)

    if (!detectedType || !ALLOWED_TYPES.includes(detectedType)) {
      return NextResponse.json(
        new AppError('ERR_UPLOAD_WRONG_FORMAT').toUserResponse('en'),
        { status: 415 }
      )
    }

    // Generate a secure path
    const ext = detectedType.split('/')[1].replace('jpeg', 'jpg')
    const prefix = purpose === 'kyc' ? `kyc/${user.id}` : `listings/${user.id}`
    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { url } = await upload(path, buffer, detectedType)

    return NextResponse.json({ success: true, data: { url, path, altText } })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(error.toUserResponse(), { status: error.httpStatus })
    }
    return NextResponse.json({ error: true, message: 'Upload failed' }, { status: 500 })
  }
}

function detectMimeType(buffer: Buffer): string | null {
  // Check magic bytes for common image formats
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png'
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return 'image/webp'
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return 'application/pdf'
  return null
}
