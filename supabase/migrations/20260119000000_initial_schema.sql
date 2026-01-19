-- ProjectHub Initial Schema Migration
-- Created: 2026-01-19

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    name VARCHAR(255),
    image TEXT,
    totp_secret TEXT,
    totp_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table (for OAuth)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type VARCHAR(50),
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

-- Recovery Codes table
CREATE TABLE recovery_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification Tokens table
CREATE TABLE verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (identifier, token)
);

-- Project Status Enum
CREATE TYPE project_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'PARTIAL');

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'PENDING',
    archived BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    retention_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio Type Enum
CREATE TYPE audio_type AS ENUM ('MONO', 'STEREO');

-- Audio Files table
CREATE TABLE audio_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    duration_seconds FLOAT,
    sample_rate INTEGER,
    channels INTEGER,
    audio_type audio_type DEFAULT 'MONO',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Enum
CREATE TYPE provider AS ENUM (
    'OPENAI_WHISPER',
    'ASSEMBLYAI',
    'GOOGLE_SPEECH',
    'AWS_TRANSCRIBE',
    'ELEVENLABS',
    'DEEPGRAM',
    'GLADIA',
    'SPEECHMATICS',
    'OPENROUTER'
);

-- Job Status Enum
CREATE TYPE job_status AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Transcription Jobs table
CREATE TABLE transcription_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    audio_file_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
    provider provider NOT NULL,
    status job_status DEFAULT 'QUEUED',
    external_job_id TEXT,
    config JSONB,
    error_message TEXT,
    processing_time_ms INTEGER,
    cost_usd DECIMAL(10, 6),
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Transcripts table
CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID UNIQUE NOT NULL REFERENCES transcription_jobs(id) ON DELETE CASCADE,
    full_text TEXT NOT NULL,
    language VARCHAR(10),
    confidence FLOAT,
    word_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transcript Segments table
CREATE TABLE transcript_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    start_time FLOAT NOT NULL,
    end_time FLOAT NOT NULL,
    confidence FLOAT,
    speaker VARCHAR(50),
    words JSONB,
    sequence_number INTEGER NOT NULL
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES transcript_segments(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    timestamp_ms BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys table (encrypted)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider provider NOT NULL,
    encrypted_key TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    last_validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Create indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_recovery_codes_user_id ON recovery_codes(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_audio_files_project_id ON audio_files(project_id);
CREATE INDEX idx_transcription_jobs_project_id ON transcription_jobs(project_id);
CREATE INDEX idx_transcription_jobs_status ON transcription_jobs(status);
CREATE INDEX idx_transcripts_job_id ON transcripts(job_id);
CREATE INDEX idx_transcript_segments_transcript_id ON transcript_segments(transcript_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users (users can only see themselves)
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Projects (users can only see their own projects)
CREATE POLICY projects_select_own ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY projects_insert_own ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY projects_update_own ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY projects_delete_own ON projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Audio Files (via project ownership)
CREATE POLICY audio_files_select_own ON audio_files FOR SELECT
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = audio_files.project_id AND projects.user_id = auth.uid()));
CREATE POLICY audio_files_insert_own ON audio_files FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = audio_files.project_id AND projects.user_id = auth.uid()));
CREATE POLICY audio_files_delete_own ON audio_files FOR DELETE
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = audio_files.project_id AND projects.user_id = auth.uid()));

-- RLS Policies for Transcription Jobs
CREATE POLICY jobs_select_own ON transcription_jobs FOR SELECT
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = transcription_jobs.project_id AND projects.user_id = auth.uid()));
CREATE POLICY jobs_insert_own ON transcription_jobs FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = transcription_jobs.project_id AND projects.user_id = auth.uid()));
CREATE POLICY jobs_update_own ON transcription_jobs FOR UPDATE
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = transcription_jobs.project_id AND projects.user_id = auth.uid()));

-- RLS Policies for Transcripts
CREATE POLICY transcripts_select_own ON transcripts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM transcription_jobs tj
        JOIN projects p ON p.id = tj.project_id
        WHERE tj.id = transcripts.job_id AND p.user_id = auth.uid()
    ));

-- RLS Policies for Transcript Segments
CREATE POLICY segments_select_own ON transcript_segments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM transcripts t
        JOIN transcription_jobs tj ON tj.id = t.job_id
        JOIN projects p ON p.id = tj.project_id
        WHERE t.id = transcript_segments.transcript_id AND p.user_id = auth.uid()
    ));

-- RLS Policies for Comments
CREATE POLICY comments_select_own ON comments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY comments_insert_own ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY comments_update_own ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY comments_delete_own ON comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for API Keys
CREATE POLICY api_keys_select_own ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY api_keys_insert_own ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY api_keys_update_own ON api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY api_keys_delete_own ON api_keys FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
