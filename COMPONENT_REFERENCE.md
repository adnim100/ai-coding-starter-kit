# Component Reference Guide

Quick reference for all dashboard and project management components.

## Dashboard Components

### ProjectCard

**Location**: `src/components/dashboard/project-card.tsx`

**Usage**:
```tsx
import { ProjectCard } from "@/components/dashboard";

<ProjectCard
  project={project}
  onRename={(id) => handleRename(id)}
  onEditTags={(id) => handleEditTags(id)}
  onArchive={(id) => handleArchive(id)}
  onDelete={(id) => handleDelete(id)}
/>
```

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `project` | `Project` | Yes | Project data object |
| `onRename` | `(id: string) => void` | No | Callback when rename is clicked |
| `onEditTags` | `(id: string) => void` | No | Callback when edit tags is clicked |
| `onArchive` | `(id: string) => void` | No | Callback when archive is clicked |
| `onDelete` | `(id: string) => void` | No | Callback when delete is clicked |

**Features**:
- Status badge with color coding
- Progress bar for processing projects
- Audio file preview (max 3)
- Tag display
- Actions dropdown menu
- Formatted dates and metadata

---

### ProjectGrid

**Location**: `src/components/dashboard/project-grid.tsx`

**Usage**:
```tsx
import { ProjectGrid } from "@/components/dashboard";

<ProjectGrid
  projects={filteredProjects}
  onCreateNew={() => router.push("/projects/new")}
  onRename={handleRename}
  onEditTags={handleEditTags}
  onArchive={handleArchive}
  onDelete={handleDelete}
/>
```

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `projects` | `Project[]` | Yes | Array of projects to display |
| `onRename` | `(id: string) => void` | No | Passed to ProjectCard |
| `onEditTags` | `(id: string) => void` | No | Passed to ProjectCard |
| `onArchive` | `(id: string) => void` | No | Passed to ProjectCard |
| `onDelete` | `(id: string) => void` | No | Passed to ProjectCard |
| `onCreateNew` | `() => void` | No | Callback for empty state CTA |

**Features**:
- Responsive grid layout (1-4 columns)
- Empty state with call-to-action
- Maps projects to ProjectCard

---

### SearchBar

**Location**: `src/components/dashboard/search-bar.tsx`

**Usage**:
```tsx
import { SearchBar } from "@/components/dashboard";

<SearchBar
  onSearch={(query) => setSearchQuery(query)}
  placeholder="Projekte durchsuchen..."
  defaultValue={searchQuery}
/>
```

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onSearch` | `(query: string) => void` | Yes | - | Callback with search query |
| `placeholder` | `string` | No | "Projekte durchsuchen..." | Input placeholder |
| `defaultValue` | `string` | No | "" | Initial value |

**Features**:
- Debounced search (300ms)
- Search icon
- Controlled component

---

### FilterDropdown

**Location**: `src/components/dashboard/filter-dropdown.tsx`

**Usage**:
```tsx
import { FilterDropdown } from "@/components/dashboard";

<FilterDropdown
  availableTags={allTags}
  selectedStatuses={selectedStatuses}
  selectedTags={selectedTags}
  onStatusChange={setSelectedStatuses}
  onTagChange={setSelectedTags}
  onClearAll={handleClearFilters}
/>
```

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `availableTags` | `string[]` | Yes | All available tags |
| `selectedStatuses` | `ProjectStatus[]` | Yes | Currently selected statuses |
| `selectedTags` | `string[]` | Yes | Currently selected tags |
| `onStatusChange` | `(statuses: ProjectStatus[]) => void` | Yes | Status change callback |
| `onTagChange` | `(tags: string[]) => void` | Yes | Tag change callback |
| `onClearAll` | `() => void` | Yes | Clear all filters callback |

**Features**:
- Multi-select for statuses
- Multi-select for tags
- Active filter count badge
- Clear all button

---

## Project Components

### AudioList

**Location**: `src/components/projects/audio-list.tsx`

**Usage**:
```tsx
import { AudioList } from "@/components/projects";

<AudioList
  audioFiles={project.audioFiles}
  onDelete={(id) => handleDeleteAudio(id)}
  onDownload={(id) => handleDownloadAudio(id)}
/>
```

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `audioFiles` | `AudioFile[]` | Yes | Array of audio files |
| `onDelete` | `(id: string) => void` | No | Delete callback |
| `onDownload` | `(id: string) => void` | No | Download callback |

**Features**:
- Inline audio player
- Play/pause toggle
- Formatted file size and duration
- Download and delete buttons
- Delete confirmation dialog

---

### JobTable

**Location**: `src/components/projects/job-table.tsx`

**Usage**:
```tsx
import { JobTable } from "@/components/projects";

<JobTable
  jobs={project.jobs}
  onViewTranscript={(jobId) => router.push(`/transcript/${jobId}`)}
  onViewDetails={(jobId) => showErrorDetails(jobId)}
  onCancel={(jobId) => cancelJob(jobId)}
/>
```

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `jobs` | `TranscriptionJob[]` | Yes | Array of jobs |
| `onViewTranscript` | `(jobId: string) => void` | No | View completed transcript |
| `onViewDetails` | `(jobId: string) => void` | No | View failed job details |
| `onCancel` | `(jobId: string) => void` | No | Cancel processing job |

**Features**:
- Status badges with icons
- Animated spinner for processing
- Formatted timestamps and durations
- Conditional action buttons
- Empty state

**Status Types**:
- `queued`: Clock icon, gray
- `processing`: Loader icon (spinning), blue
- `completed`: CheckCircle icon, green
- `failed`: XCircle icon, red

---

### TagEditor

**Location**: `src/components/projects/tag-editor.tsx`

**Usage**:
```tsx
import { TagEditor } from "@/components/projects";

<TagEditor
  tags={project.tags}
  availableTags={allExistingTags}
  onTagsChange={(newTags) => updateProjectTags(newTags)}
/>
```

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tags` | `string[]` | Yes | Current tags |
| `availableTags` | `string[]` | Yes | Existing tags for autocomplete |
| `onTagsChange` | `(tags: string[]) => void` | Yes | Tag change callback |

**Features**:
- Display tags as removable badges
- Add new tags via popover
- Autocomplete from existing tags
- Create new tag option
- Keyboard support (Enter to add, X to remove)
- Case-insensitive matching

---

## Type Interfaces

### Project
```typescript
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
```

### AudioFile
```typescript
interface AudioFile {
  id: string;
  name: string;
  size: number;          // in bytes
  duration: number;      // in seconds
  type: string;          // e.g., "mp3", "wav"
  url: string;
  uploadedAt: Date;
}
```

### TranscriptionJob
```typescript
interface TranscriptionJob {
  id: string;
  providerId: string;
  providerName: string;
  status: JobStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;     // in seconds
  error?: string;
  transcriptUrl?: string;
}
```

### Enums
```typescript
type ProjectStatus = 'processing' | 'completed' | 'failed' | 'partial';
type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'status';
```

---

## Common Patterns

### Creating a new project
```typescript
const handleCreateProject = async (data: {
  name: string;
  description?: string;
  tags: string[];
}) => {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const project = await response.json();
    router.push(`/projects/${project.id}`);
  } catch (error) {
    toast.error("Fehler beim Erstellen des Projekts");
  }
};
```

### Filtering projects
```typescript
const filteredProjects = useMemo(() => {
  return projects.filter(project => {
    // Search filter
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(project.status)) {
      return false;
    }

    // Tag filter
    if (selectedTags.length > 0 && !selectedTags.some(tag => project.tags.includes(tag))) {
      return false;
    }

    // Archive filter
    if (!showArchived && project.isArchived) {
      return false;
    }

    return true;
  });
}, [projects, searchQuery, selectedStatuses, selectedTags, showArchived]);
```

### Sorting projects
```typescript
const sortedProjects = useMemo(() => {
  return [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'status':
        const order = { completed: 0, processing: 1, partial: 2, failed: 3 };
        return order[a.status] - order[b.status];
      default:
        return 0;
    }
  });
}, [filteredProjects, sortBy]);
```

### Real-time job updates
```typescript
useEffect(() => {
  if (!project) return;

  const hasProcessingJobs = project.jobs.some(j => j.status === 'processing');
  if (!hasProcessingJobs) return;

  const interval = setInterval(async () => {
    // Poll for updates
    const updated = await fetchProject(project.id);
    setProject(updated);
  }, 5000); // Poll every 5 seconds

  return () => clearInterval(interval);
}, [project]);
```

---

## Styling Guidelines

All components use Tailwind CSS and shadcn/ui design tokens:

**Colors**:
- Background: `bg-background`
- Foreground: `text-foreground`
- Muted: `text-muted-foreground`, `bg-muted`
- Destructive: `text-destructive`, `bg-destructive`

**Spacing**:
- Container padding: `py-8 px-4`
- Component spacing: `space-y-4`, `space-y-6`
- Grid gaps: `gap-6`

**Responsive**:
- Mobile first: `md:`, `lg:`, `xl:` breakpoints
- Grid columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

**Typography**:
- Page title: `text-3xl font-bold tracking-tight`
- Section title: `text-xl font-semibold`
- Body: Default (16px)
- Small: `text-sm`
- Extra small: `text-xs`

---

## Accessibility

All components include:
- Semantic HTML (`<main>`, `<nav>`, `<article>`, etc.)
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus management in dialogs
- Screen reader friendly labels

---

## Testing Recommendations

**Unit Tests**:
```typescript
// Example: SearchBar component
describe('SearchBar', () => {
  it('debounces search input', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(onSearch).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test');
    }, { timeout: 400 });
  });
});
```

**Integration Tests**:
```typescript
// Example: Dashboard page
describe('Dashboard Page', () => {
  it('filters projects by status', () => {
    render(<DashboardPage />);

    // Open filter dropdown
    fireEvent.click(screen.getByText('Filter'));

    // Select "Completed" status
    fireEvent.click(screen.getByText('Completed'));

    // Verify only completed projects are shown
    const cards = screen.getAllByTestId('project-card');
    expect(cards).toHaveLength(1);
  });
});
```

---

## Performance Tips

1. **Use `useMemo` for expensive computations**:
   - Filtering large project lists
   - Sorting operations
   - Deriving available tags

2. **Debounce user input**:
   - Search queries (300ms)
   - Auto-save operations

3. **Virtualize long lists**:
   - Use `react-window` for 100+ projects
   - Implement pagination as alternative

4. **Optimize images**:
   - Use Next.js Image component
   - Lazy load below the fold

5. **Code splitting**:
   - Dynamic imports for modals
   - Route-based splitting (already done with Next.js)

---

## Common Customizations

### Change debounce delay
```tsx
// In SearchBar component
useEffect(() => {
  const timer = setTimeout(() => {
    onSearch(query);
  }, 500); // Change from 300ms to 500ms

  return () => clearTimeout(timer);
}, [query, onSearch]);
```

### Add new status type
```tsx
// In types.ts
type ProjectStatus = 'processing' | 'completed' | 'failed' | 'partial' | 'archived';

// In ProjectCard component
const statusConfig: Record<ProjectStatus, {...}> = {
  // ... existing statuses
  archived: {
    label: "Archived",
    variant: "outline",
    className: "bg-gray-100 text-gray-800"
  }
};
```

### Customize grid columns
```tsx
// In ProjectGrid component
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Changed from lg:grid-cols-3 to lg:grid-cols-4 */}
</div>
```

---

For complete implementation details, see `DASHBOARD_DOCUMENTATION.md`.
