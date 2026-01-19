import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/projects/[id] - Get project details
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        audio_files (*),
        transcription_jobs (
          *,
          transcripts (
            id,
            full_text,
            language,
            confidence,
            word_count
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, tags, archived } = body

    // Verify ownership
    const { data: existing, error: existingError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (tags !== undefined) updateData.tags = tags
    if (archived !== undefined) updateData.archived = archived

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: existing, error: existingError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Cancel any running jobs
    await supabase
      .from('transcription_jobs')
      .update({
        status: 'CANCELLED',
        completed_at: new Date().toISOString(),
      })
      .eq('project_id', id)
      .eq('status', 'PROCESSING')

    // Delete project (cascade will delete related records if configured)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
