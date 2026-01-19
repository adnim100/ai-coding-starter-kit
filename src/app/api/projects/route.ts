import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side operations to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/projects - List all projects for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const archived = searchParams.get('archived') === 'true'
    const search = searchParams.get('search')

    let query = supabase
      .from('projects')
      .select(`
        *,
        audio_files (id, filename, duration_seconds),
        transcription_jobs (id, provider, status)
      `)
      .eq('user_id', session.user.id)
      .eq('archived', archived)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: projects, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, tags } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        tags: tags || [],
        user_id: session.user.id,
        status: 'PENDING',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: 'Failed to create project', details: error.message }, { status: 500 })
    }

    console.log('Project created successfully:', project?.id)
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
