// Project status types
export type ProjectStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';

// Job status types
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

// Provider type
export interface Provider {
  id: string;
  name: string;
  displayName: string;
}

// Audio file type
export interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

// Transcription job type
export interface TranscriptionJob {
  id: string;
  providerId: string;
  providerName: string;
  status: JobStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  transcriptUrl?: string;
}

// Project type
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  tags: string[];
  audioFiles: AudioFile[];
  jobs: TranscriptionJob[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  totalCost?: number;
}

// Filter options
export interface FilterOptions {
  status?: ProjectStatus[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

// Sort options
export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'status';
