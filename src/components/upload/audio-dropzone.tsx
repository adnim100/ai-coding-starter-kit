'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface AudioFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  audioFileId?: string
}

interface AudioDropzoneProps {
  projectId: string
  onUploadComplete?: (audioFileIds: string[]) => void
  maxFiles?: number
  audioType: 'MONO' | 'STEREO'
}

export function AudioDropzone({
  projectId,
  onUploadComplete,
  maxFiles = 10,
  audioType,
}: AudioDropzoneProps) {
  const [files, setFiles] = useState<AudioFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: AudioFile[] = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substring(7),
        progress: 0,
        status: 'pending',
      }))

      setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles))
    },
    [maxFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.wav', '.mp3', '.mp4', '.m4a', '.flac', '.ogg', '.webm'],
    },
    maxFiles,
    disabled: isUploading,
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const uploadFiles = async () => {
    setIsUploading(true)
    const uploadedIds: string[] = []

    for (const audioFile of files) {
      if (audioFile.status === 'completed') continue

      setFiles((prev) =>
        prev.map((f) =>
          f.id === audioFile.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
        )
      )

      try {
        const formData = new FormData()
        formData.append('file', audioFile.file)
        formData.append('projectId', projectId)
        formData.append('audioType', audioType)

        const response = await fetch('/api/audio/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()

        setFiles((prev) =>
          prev.map((f) =>
            f.id === audioFile.id
              ? {
                  ...f,
                  status: 'completed' as const,
                  progress: 100,
                  audioFileId: result.audioFile.id,
                }
              : f
          )
        )

        uploadedIds.push(result.audioFile.id)
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === audioFile.id
              ? {
                  ...f,
                  status: 'error' as const,
                  error: 'Upload failed',
                }
              : f
          )
        )
      }
    }

    setIsUploading(false)

    if (uploadedIds.length > 0 && onUploadComplete) {
      onUploadComplete(uploadedIds)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const allCompleted = files.length > 0 && files.every((f) => f.status === 'completed')
  const hasErrors = files.some((f) => f.status === 'error')

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          !isDragActive && 'border-gray-300 hover:border-gray-400',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              Drag & drop audio files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports WAV, MP3, MP4, M4A, FLAC, OGG, WEBM (max {maxFiles} files)
            </p>
          </>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((audioFile) => (
            <div
              key={audioFile.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-white"
            >
              <div className="flex-shrink-0">
                {audioFile.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {audioFile.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                {(audioFile.status === 'pending' || audioFile.status === 'uploading') && (
                  <File className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{audioFile.file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(audioFile.file.size)}
                </p>

                {audioFile.status === 'uploading' && (
                  <Progress value={audioFile.progress} className="mt-2 h-1" />
                )}

                {audioFile.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">{audioFile.error}</p>
                )}
              </div>

              {audioFile.status !== 'uploading' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(audioFile.id)}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !allCompleted && (
        <Button
          onClick={uploadFiles}
          disabled={isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
        </Button>
      )}

      {allCompleted && (
        <div className="text-center p-4 bg-green-50 text-green-700 rounded-lg">
          <CheckCircle className="w-6 h-6 mx-auto mb-2" />
          <p className="font-medium">All files uploaded successfully!</p>
        </div>
      )}

      {hasErrors && (
        <div className="text-center p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          <p className="font-medium">Some uploads failed. Please try again.</p>
        </div>
      )}
    </div>
  )
}
