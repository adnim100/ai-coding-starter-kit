import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { uploadAudioFile } from '@/lib/storage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const ALLOWED_TYPES = [
  'audio/wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/flac',
  'audio/ogg',
  'audio/webm',
  'video/mp4', // For video files with audio
]

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const audioType = (formData.get('audioType') as string) || 'MONO'

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          allowedTypes: ALLOWED_TYPES,
        },
        { status: 400 }
      )
    }

    // Upload to storage
    const uploadResult = await uploadAudioFile(file, projectId)

    if (uploadResult.error) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadResult.error}` },
        { status: 500 }
      )
    }

    // Save to database
    const { data: audioFile, error: insertError } = await supabase
      .from('audio_files')
      .insert({
        project_id: projectId,
        filename: file.name,
        storage_path: uploadResult.path,
        storage_url: uploadResult.url,
        file_size: file.size,
        mime_type: file.type,
        duration_seconds: null, // Can be calculated client-side or via serverless function
        audio_type: audioType,
        channels: audioType === 'STEREO' ? 2 : 1,
      })
      .select('id, filename, storage_url, file_size, duration_seconds, audio_type')
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save audio file record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      audioFile: {
        id: audioFile.id,
        filename: audioFile.filename,
        url: audioFile.storage_url,
        size: audioFile.file_size,
        duration: audioFile.duration_seconds,
        audioType: audioFile.audio_type,
      },
    })
  } catch (error) {
    console.error('Audio upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload audio file' },
      { status: 500 }
    )
  }
}
