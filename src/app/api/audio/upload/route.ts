import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadAudioFile } from '@/lib/storage'
import { z } from 'zod'

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
    const session = await getServerSession(authOptions)
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
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
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

    // Analyze audio metadata (simplified - in production use ffmpeg)
    const duration = await getAudioDuration(file)

    // Save to database
    const audioFile = await prisma.audioFile.create({
      data: {
        projectId,
        filename: file.name,
        storagePath: uploadResult.path,
        storageUrl: uploadResult.url,
        fileSize: file.size,
        mimeType: file.type,
        durationSeconds: duration,
        audioType: audioType as 'MONO' | 'STEREO',
        channels: audioType === 'STEREO' ? 2 : 1,
      },
    })

    return NextResponse.json({
      success: true,
      audioFile: {
        id: audioFile.id,
        filename: audioFile.filename,
        url: audioFile.storageUrl,
        size: audioFile.fileSize,
        duration: audioFile.durationSeconds,
        audioType: audioFile.audioType,
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

/**
 * Get audio duration (simplified version)
 * In production, use ffmpeg or similar for accurate metadata
 */
async function getAudioDuration(file: File): Promise<number | null> {
  try {
    // Create audio element to get duration
    const arrayBuffer = await file.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: file.type })
    const url = URL.createObjectURL(blob)

    return new Promise((resolve) => {
      const audio = new Audio(url)
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url)
        resolve(audio.duration)
      })
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url)
        resolve(null)
      })
    })
  } catch (error) {
    console.error('Duration extraction error:', error)
    return null
  }
}
