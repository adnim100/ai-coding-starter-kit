import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Encryption helpers
function encrypt(text: string): string {
  const algorithm = 'aes-256-cbc'
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return iv.toString('hex') + ':' + encrypted
}

// GET - List all API keys (without actual keys)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, provider, is_valid, last_validated_at, created_at, updated_at')
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Get API keys error:', error)
      return NextResponse.json({ error: 'Failed to get API keys' }, { status: 500 })
    }

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json({ error: 'Failed to get API keys' }, { status: 500 })
  }
}

const createApiKeySchema = z.object({
  provider: z.string(),
  apiKey: z.string().min(1),
})

// POST - Create or update API key
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, apiKey } = createApiKeySchema.parse(body)

    // Encrypt API key
    const encryptedKey = encrypt(apiKey)

    // Check if key already exists
    const { data: existingKey } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('provider', provider)
      .single()

    let savedKey
    if (existingKey) {
      // Update existing
      const { data, error } = await supabase
        .from('api_keys')
        .update({
          encrypted_key: encryptedKey,
          is_valid: true,
          last_validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingKey.id)
        .select('id, provider, is_valid, last_validated_at, created_at, updated_at')
        .single()

      if (error) throw error
      savedKey = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: session.user.id,
          provider,
          encrypted_key: encryptedKey,
          is_valid: true,
          last_validated_at: new Date().toISOString(),
        })
        .select('id, provider, is_valid, last_validated_at, created_at, updated_at')
        .single()

      if (error) throw error
      savedKey = data
    }

    return NextResponse.json({ apiKey: savedKey })
  } catch (error) {
    console.error('Create API key error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 })
  }
}

// DELETE - Remove API key
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('user_id', session.user.id)
      .eq('provider', provider)

    if (error) {
      console.error('Delete API key error:', error)
      return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete API key error:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
