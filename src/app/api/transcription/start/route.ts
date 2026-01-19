import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addTranscriptionJob } from '@/lib/queue'
import { getProvider } from '@/lib/transcription'
import { z } from 'zod'

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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = startTranscriptionSchema.parse(body)

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify audio file
    const audioFile = await prisma.audioFile.findFirst({
      where: {
        id: validatedData.audioFileId,
        projectId: validatedData.projectId,
      },
    })

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 })
    }

    // Get user's API keys for selected providers
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
        provider: {
          in: validatedData.providers,
        },
      },
    })

    // Validate all required API keys are present
    const missingProviders = validatedData.providers.filter(
      (provider) => !apiKeys.find((key) => key.provider === provider)
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
      const apiKey = apiKeys.find((key) => key.provider === providerName)
      if (!apiKey) continue

      const provider = getProvider(providerName)
      if (!provider) continue

      // Create job record
      const job = await prisma.transcriptionJob.create({
        data: {
          projectId: validatedData.projectId,
          audioFileId: validatedData.audioFileId,
          provider: providerName as any,
          status: 'QUEUED',
          config: validatedData.config || {},
        },
      })

      // Add to queue
      await addTranscriptionJob({
        jobId: job.id,
        projectId: validatedData.projectId,
        audioFileId: validatedData.audioFileId,
        provider: providerName,
        audioUrl: audioFile.storageUrl,
        config: validatedData.config || {},
        apiKey: apiKey.encryptedKey, // TODO: Decrypt in worker
        userId: session.user.id,
      })

      jobs.push(job)
    }

    // Update project status
    await prisma.project.update({
      where: { id: validatedData.projectId },
      data: { status: 'PROCESSING' },
    })

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
