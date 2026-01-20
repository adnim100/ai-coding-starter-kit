import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client mit Service Role Key für serverseitige Operationen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

const AUDIO_BUCKET = 'audio-files'

export interface UploadResult {
  path: string
  url: string
  error?: string
}

/**
 * Upload audio file to Supabase Storage
 * @param file - The file to upload
 * @param projectId - The project ID for organizing files
 * @returns Upload result with path and public URL
 */
export async function uploadAudioFile(
  file: File,
  projectId: string
): Promise<UploadResult> {
  try {
    // Generate unique file path
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${projectId}/${timestamp}-${sanitizedFilename}`

    // Upload file
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { path: '', url: '', error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(filePath)

    return {
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error('Unexpected upload error:', error)
    return {
      path: '',
      url: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete audio file from storage
 * @param path - The storage path of the file
 */
export async function deleteAudioFile(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(AUDIO_BUCKET).remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected delete error:', error)
    return false
  }
}

/**
 * Delete all audio files for a project
 * @param projectId - The project ID
 */
export async function deleteProjectAudioFiles(projectId: string): Promise<boolean> {
  try {
    // List all files in project folder
    const { data: files, error: listError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .list(projectId)

    if (listError) {
      console.error('List error:', listError)
      return false
    }

    if (!files || files.length === 0) {
      return true // No files to delete
    }

    // Delete all files
    const filePaths = files.map((file) => `${projectId}/${file.name}`)
    const { error: deleteError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .remove(filePaths)

    if (deleteError) {
      console.error('Batch delete error:', deleteError)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected batch delete error:', error)
    return false
  }
}

/**
 * Get signed URL for private audio file access
 * @param path - The storage path
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 */
export async function getSignedAudioUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Unexpected signed URL error:', error)
    return null
  }
}

/**
 * Get file size and metadata
 * @param path - The storage path
 */
export async function getAudioFileInfo(path: string) {
  try {
    const { data, error } = await supabase.storage.from(AUDIO_BUCKET).list(path)

    if (error) {
      console.error('File info error:', error)
      return null
    }

    return data[0] || null
  } catch (error) {
    console.error('Unexpected file info error:', error)
    return null
  }
}
