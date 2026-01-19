# ProjectHub - Dashboard & Project Management UI

Complete implementation of the dashboard and project management interface for ProjectHub, based on PROJ-9 specification.

## Architecture Overview

### Pages Structure

```
src/app/(dashboard)/
├── layout.tsx                    # Dashboard layout with Toaster
├── dashboard/
│   └── page.tsx                  # Main dashboard with project grid, filters, search
├── projects/
│   ├── new/
│   │   └── page.tsx             # Create new project form
│   └── [id]/
│       └── page.tsx             # Project detail view
└── settings/
    └── page.tsx                 # User settings with tabs
```

### Components Structure

```
src/components/
├── dashboard/
│   ├── index.ts                 # Barrel export
│   ├── project-card.tsx         # Individual project card with status, tags, actions
│   ├── project-grid.tsx         # Grid layout with empty state
│   ├── search-bar.tsx           # Debounced search input (300ms)
│   └── filter-dropdown.tsx      # Multi-select filters for status & tags
└── projects/
    ├── index.ts                 # Barrel export
    ├── audio-list.tsx           # List of audio files with player & actions
    ├── job-table.tsx            # Table of transcription jobs with status
    └── tag-editor.tsx           # Add/remove tags with autocomplete
```

### Type Definitions

```
src/lib/types.ts                 # All TypeScript interfaces and types
```

## Features Implemented

### Dashboard Page (`/dashboard`)

**Features:**
- Project grid view with cards (responsive: 1-4 columns)
- Search bar with live search (debounced 300ms)
- Multi-filter dropdown (status + tags)
- Sort options: Newest, Oldest, Name A-Z, Name Z-A, Status
- "Show archived" toggle
- Active filter count indicator
- Empty state with call-to-action
- Results counter

**Mock Data:**
- 3 sample projects with different statuses
- Demonstrates all status types: completed, processing, failed

**Actions:**
- Create new project (routes to `/projects/new`)
- Open project (routes to `/projects/{id}`)
- Rename, Edit tags, Archive, Delete (console logged for now)

### New Project Page (`/projects/new`)

**Features:**
- Form with name (required), description (optional), tags (optional)
- Tag editor with autocomplete
- Form validation
- Back navigation
- Info box showing next steps
- Toast notifications

**Flow:**
1. User fills form
2. Creates project
3. Redirects to project detail (or upload page in final implementation)

### Project Detail Page (`/projects/{id}`)

**Features:**
- Breadcrumb navigation
- Inline project name editing
- Compare transcripts button (conditional - only if completed jobs exist)
- Delete project with confirmation dialog

**Sections:**
1. **Audio Files**
   - List with inline audio player
   - File details: size, duration, type
   - Download and delete actions

2. **Provider Jobs**
   - Table showing all transcription jobs
   - Status badges with icons (animated spinner for processing)
   - Timestamps and duration
   - Conditional actions: View transcript, View details, Cancel

3. **Tags**
   - Tag editor with add/remove
   - Autocomplete from existing tags

4. **Metadata**
   - Created/Updated timestamps
   - Total cost
   - Project ID

**Delete Dialog:**
- Warning message
- Shows what will be deleted
- Checkbox acknowledgment
- Text confirmation ("DELETE")
- Disabled submit until conditions met

### Settings Page (`/settings`)

**Features:**
- Tabbed interface with 5 tabs
- Responsive tab labels (icons only on mobile)

**Tabs:**
1. **Profile** - Name, email, password change
2. **Notifications** - Email notifications toggles
3. **API Keys** - Provider API key management
4. **Appearance** - Theme and language selection
5. **Data** - Export data, delete account (danger zone)

## Components Documentation

### Dashboard Components

#### ProjectCard
```tsx
interface ProjectCardProps {
  project: Project;
  onRename?: (id: string) => void;
  onEditTags?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}
```

**Displays:**
- Project name and status badge
- Description (if available)
- Audio files (max 3, shows "+X more")
- Progress bar (only for processing status)
- Tags as pills
- Metadata: audio count, provider count, created date
- Actions dropdown menu

**Status Badges:**
- Processing: Yellow with spinner
- Completed: Green with checkmark
- Failed: Red with X
- Partial: Orange with warning

#### ProjectGrid
```tsx
interface ProjectGridProps {
  projects: Project[];
  onRename?: (id: string) => void;
  onEditTags?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreateNew?: () => void;
}
```

**Features:**
- Responsive grid (1-4 columns based on screen size)
- Empty state when no projects
- Maps projects to ProjectCard components

#### SearchBar
```tsx
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}
```

**Features:**
- Debounced search (300ms)
- Search icon
- Configurable placeholder

#### FilterDropdown
```tsx
interface FilterDropdownProps {
  availableTags: string[];
  selectedStatuses: ProjectStatus[];
  selectedTags: string[];
  onStatusChange: (statuses: ProjectStatus[]) => void;
  onTagChange: (tags: string[]) => void;
  onClearAll: () => void;
}
```

**Features:**
- Multi-select for statuses
- Multi-select for tags
- Active filter count badge
- Clear all filters button

### Project Components

#### AudioList
```tsx
interface AudioListProps {
  audioFiles: AudioFile[];
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}
```

**Features:**
- Play/pause toggle for each file
- Inline HTML5 audio player
- Formatted file size and duration
- Delete confirmation dialog
- Download button

#### JobTable
```tsx
interface JobTableProps {
  jobs: TranscriptionJob[];
  onViewTranscript?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
}
```

**Features:**
- Status badges with icons
- Animated spinner for processing
- Formatted timestamps
- Conditional action buttons
- Empty state message

#### TagEditor
```tsx
interface TagEditorProps {
  tags: string[];
  availableTags: string[];
  onTagsChange: (tags: string[]) => void;
}
```

**Features:**
- Display current tags as removable badges
- Add new tags via popover
- Autocomplete from existing tags
- Create new tags option
- Keyboard support (Enter to add)

## Type System

### Core Types

```typescript
type ProjectStatus = 'processing' | 'completed' | 'failed' | 'partial';
type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'status';

interface Project {
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

interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

interface TranscriptionJob {
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
```

## Styling & UI Components

All components use **shadcn/ui** primitives:

- `Button` - Actions and CTAs
- `Card` - Content containers
- `Badge` - Status and tags
- `Input` - Form fields
- `Textarea` - Multi-line input
- `Select` - Dropdowns
- `DropdownMenu` - Action menus
- `Dialog` / `AlertDialog` - Modals
- `Tabs` - Settings navigation
- `Switch` - Toggle settings
- `Checkbox` - Confirmations
- `Progress` - Job progress
- `Table` - Job listings
- `Popover` - Tag autocomplete
- `Command` - Search interface
- `Breadcrumb` - Navigation
- `Separator` - Visual dividers
- `Skeleton` - Loading states (ready to implement)
- `Toaster` / `toast` - Notifications

## Navigation Flow

```
/dashboard
  ├─→ /projects/new (Create Project)
  │     └─→ /projects/{id} (After creation)
  │
  ├─→ /projects/{id} (View Project)
  │     ├─→ /projects/{id}/compare (Compare Transcripts)
  │     └─→ /dashboard (After deletion)
  │
  └─→ /settings (User Settings)
```

## Integration Points

### Data Fetching (TODO)
Replace mock data with actual API calls:
- `mockProjects` → API endpoint for user projects
- `mockAvailableTags` → API endpoint for existing tags
- Project CRUD operations

### URL State Management (TODO)
Implement URL query parameters for shareable links:
```typescript
/dashboard?status=completed&tags=interview&sort=newest&q=CEO
```

Recommended: Use `nuqs` or `next-usequerystate` for URL state sync.

### Real-time Updates (TODO)
Implement polling or WebSocket for job status updates:
- Poll every 5-10 seconds when processing jobs exist
- Update project status in real-time
- Show toast notifications on completion

### File Operations (TODO)
Implement actual file handling:
- Audio file upload (drag & drop with `react-dropzone`)
- Download audio files
- Delete files from storage

### Authentication (TODO)
- Protect dashboard routes
- User context for API calls
- Redirect to login if not authenticated

## Mock Data

The implementation includes realistic mock data for demonstration:

**Dashboard:**
- 3 projects with different statuses
- Various audio files and jobs
- Multiple tags and metadata

**Project Detail:**
- Complete project with 3 providers
- Audio file with player controls
- All job statuses represented

## Performance Considerations

**Implemented:**
- Debounced search (300ms)
- Memoized filter/sort operations (`useMemo`)
- Conditional rendering for performance

**Ready to Implement:**
- Pagination (20 items per page)
- Infinite scroll
- Virtualized lists for large datasets
- Skeleton loading states

## Accessibility

All components follow accessibility best practices:
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus management in dialogs
- Screen reader friendly

## Responsive Design

Breakpoints used:
- Mobile: 1 column grid
- Tablet: 2 columns
- Desktop: 3 columns
- Large: 4 columns

## Next Steps

1. **API Integration**: Replace mock data with actual API calls
2. **URL State**: Implement shareable filter/search URLs
3. **Real-time**: Add polling or WebSocket for job updates
4. **File Upload**: Integrate with PROJ-6 for audio upload
5. **Transcription**: Connect to PROJ-7 for job management
6. **Comparison**: Link to PROJ-8 for transcript comparison
7. **Testing**: Add unit and integration tests
8. **Error Handling**: Implement error boundaries and retry logic

## File Locations Reference

### Pages
- Dashboard: `src/app/(dashboard)/dashboard/page.tsx`
- New Project: `src/app/(dashboard)/projects/new/page.tsx`
- Project Detail: `src/app/(dashboard)/projects/[id]/page.tsx`
- Settings: `src/app/(dashboard)/settings/page.tsx`
- Layout: `src/app/(dashboard)/layout.tsx`

### Dashboard Components
- Project Card: `src/components/dashboard/project-card.tsx`
- Project Grid: `src/components/dashboard/project-grid.tsx`
- Search Bar: `src/components/dashboard/search-bar.tsx`
- Filter Dropdown: `src/components/dashboard/filter-dropdown.tsx`

### Project Components
- Audio List: `src/components/projects/audio-list.tsx`
- Job Table: `src/components/projects/job-table.tsx`
- Tag Editor: `src/components/projects/tag-editor.tsx`

### Types
- Type Definitions: `src/lib/types.ts`

### Utilities
- CN Helper: `src/lib/utils.ts`

## Usage Examples

### Dashboard Page
```tsx
// Already implemented - just navigate to /dashboard
// Features: Search, Filter, Sort, Archive toggle
// Actions: Create, Rename, Edit tags, Archive, Delete
```

### Creating a Project
```tsx
// Navigate to /projects/new
// Fill form: name (required), description, tags
// Submit → redirects to project detail
```

### Viewing Project Details
```tsx
// Navigate to /projects/{id}
// Sections: Audio files, Jobs, Tags, Metadata
// Actions: Rename, Delete, Compare (if completed)
```

### Managing Settings
```tsx
// Navigate to /settings
// Tabs: Profile, Notifications, API Keys, Appearance, Data
// All settings have save buttons with toast feedback
```

## Design Decisions

1. **Client Components**: All pages use "use client" for interactivity
2. **Mock Data**: Included for demonstration, clearly marked for replacement
3. **Toast Notifications**: Using Sonner for consistent feedback
4. **German Language**: UI text in German per spec (PROJ-9)
5. **Confirmation Dialogs**: For destructive actions (delete)
6. **Inline Editing**: For project names (better UX)
7. **Conditional Rendering**: Show/hide based on state (e.g., progress bars)
8. **Responsive Design**: Mobile-first approach

## Browser Support

Tested and optimized for:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**Implementation Status**: ✅ Complete and ready for integration

All components are fully functional with mock data. Replace mock data with actual API calls to connect to backend services.
