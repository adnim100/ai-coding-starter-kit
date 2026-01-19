import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { addTranscriptionJob } from '@/lib/queue'
import { getProvider } from '@/lib/transcription'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const startTranscriptionSchema = z.object({
  projectId: z.string().uuid(),
  audioFileId: z.string().uuid(),
  providers: z.array(z.string()).min(1).max(9),
  config: z.object({
    language: z.string().optional(),
    enableDiarization: z.boolean().optional(),
    enableTimestamps: z.boolean().optional(),
    modelName: z.string().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = startTranscriptionSchema.parse(body)

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', validatedData.projectId)
      .eq('user_id', session.user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify audio file
    const { data: audioFile, error: audioError } = await supabase
      .from('audio_files')
      .select('id, storage_url')
      .eq('id', validatedData.audioFileId)
      .eq('project_id', validatedData.projectId)
      .single()

    if (audioError || !audioFile) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 })
    }

    // Get user's API keys for selected providers
    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('id, provider, encrypted_key')
      .eq('user_id', session.user.id)
      .in('provider', validatedData.providers)

    if (keysError) {
      console.error('API keys fetch error:', keysError)
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
    }

    // Validate all required API keys are present
    const missingProviders = validatedData.providers.filter(
      (provider) => !apiKeys?.find((key) => key.provider === provider)
    )

    if (missingProviders.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing API keys for providers',
          missingProviders,
        },
        { status: 400 }
      )
    }

    // Create transcription jobs
    const jobs = []

    for (const providerName of validatedData.providers) {
      const apiKey = apiKeys?.find((key) => key.provider === providerName)
      if (!apiKey) continue

      const provider = getProvider(providerName)
      if (!provider) continue

      // Create job record
      const { data: job, error: jobError } = await supabase
        .from('transcription_jobs')
        .insert({
          project_id: validatedData.projectId,
          audio_file_id: validatedData.audioFileId,
          provider: providerName,
          status: 'QUEUED',
          config: validatedData.config || {},
        })
        .select('id, provider, status')
        .single()

      if (jobError || !job) {
        console.error('Job creation error:', jobError)
        continue
      }

      // Add to queue
      await addTranscriptionJob({
        jobId: job.id,
        projectId: validatedData.projectId,
        audioFileId: validatedData.audioFileId,
        provider: providerName,
        audioUrl: audioFile.storage_url,
        config: validatedData.config || {},
        apiKey: apiKey.encrypted_key,
        userId: session.user.id,
      })

      jobs.push(job)
    }

    // Update project status
    await supabase
      .from('projects')
      .update({ status: 'PROCESSING' })
      .eq('id', validatedData.projectId)

    return NextResponse.json({
      success: true,
      jobs: jobs.map((job) => ({
        id: job.id,
        provider: job.provider,
        status: job.status,
      })),
    })
  } catch (error) {
    console.error('Transcription start error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to start transcription' },
      { status: 500 }
    )
  }
}
