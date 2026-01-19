"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SearchBar } from "@/components/dashboard/search-bar";
import { FilterDropdown } from "@/components/dashboard/filter-dropdown";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { Project, ProjectStatus, SortOption } from "@/lib/types";

// Mock data - Replace with actual API calls
const mockProjects: Project[] = [
  {
    id: "1",
    name: "Interview mit CEO",
    description: "Wichtiges Interview für den Jahresbericht",
    status: "completed",
    tags: ["Interview", "Deutsch"],
    audioFiles: [
      {
        id: "a1",
        name: "interview_ceo.mp3",
        size: 5242880,
        duration: 1800,
        type: "mp3",
        url: "/audio/sample.mp3",
        uploadedAt: new Date("2025-01-15")
      }
    ],
    jobs: [
      {
        id: "j1",
        providerId: "openai",
        providerName: "OpenAI Whisper",
        status: "completed",
        startedAt: new Date("2025-01-15T10:00:00"),
        completedAt: new Date("2025-01-15T10:05:00"),
        duration: 300
      },
      {
        id: "j2",
        providerId: "deepgram",
        providerName: "Deepgram",
        status: "completed",
        startedAt: new Date("2025-01-15T10:00:00"),
        completedAt: new Date("2025-01-15T10:04:30"),
        duration: 270
      }
    ],
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
    isArchived: false
  },
  {
    id: "2",
    name: "Podcast Episode 42",
    description: "Diskussion über AI und Zukunft der Arbeit",
    status: "processing",
    tags: ["Podcast", "Englisch"],
    audioFiles: [
      {
        id: "a2",
        name: "podcast_ep42.wav",
        size: 10485760,
        duration: 3600,
        type: "wav",
        url: "/audio/sample.wav",
        uploadedAt: new Date("2025-01-18")
      }
    ],
    jobs: [
      {
        id: "j3",
        providerId: "openai",
        providerName: "OpenAI Whisper",
        status: "completed",
        startedAt: new Date("2025-01-18T14:00:00"),
        completedAt: new Date("2025-01-18T14:12:00"),
        duration: 720
      },
      {
        id: "j4",
        providerId: "assemblyai",
        providerName: "AssemblyAI",
        status: "processing",
        startedAt: new Date("2025-01-18T14:00:00")
      }
    ],
    createdAt: new Date("2025-01-18"),
    updatedAt: new Date("2025-01-18"),
    isArchived: false
  },
  {
    id: "3",
    name: "Meeting Notes",
    status: "failed",
    tags: ["Meeting"],
    audioFiles: [
      {
        id: "a3",
        name: "meeting_jan_2025.mp3",
        size: 3145728,
        duration: 900,
        type: "mp3",
        url: "/audio/sample.mp3",
        uploadedAt: new Date("2025-01-10")
      }
    ],
    jobs: [
      {
        id: "j5",
        providerId: "openai",
        providerName: "OpenAI Whisper",
        status: "failed",
        startedAt: new Date("2025-01-10T09:00:00"),
        error: "Audio quality too low"
      }
    ],
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
    isArchived: false
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showArchived, setShowArchived] = useState(false);

  // Get all available tags from projects
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    mockProjects.forEach(project => {
      project.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, []);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = mockProjects;

    // Filter by archived status
    if (!showArchived) {
      filtered = filtered.filter(p => !p.isArchived);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.audioFiles.some(f => f.name.toLowerCase().includes(query)) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(p => selectedStatuses.includes(p.status));
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p =>
        selectedTags.some(tag => p.tags.includes(tag))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "status":
          const statusOrder = { completed: 0, processing: 1, partial: 2, failed: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedStatuses, selectedTags, sortBy, showArchived]);

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSelectedTags([]);
    setSearchQuery("");
  };

  const activeFilterCount = selectedStatuses.length + selectedTags.length;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meine Projekte</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie alle Ihre Transkriptions-Projekte
          </p>
        </div>
        <Button onClick={() => router.push("/projects/new")} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Neues Projekt
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center flex-1">
          <SearchBar
            onSearch={setSearchQuery}
            defaultValue={searchQuery}
          />
          <FilterDropdown
            availableTags={availableTags}
            selectedStatuses={selectedStatuses}
            selectedTags={selectedTags}
            onStatusChange={setSelectedStatuses}
            onTagChange={setSelectedTags}
            onClearAll={handleClearFilters}
          />
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[200px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Neueste zuerst</SelectItem>
              <SelectItem value="oldest">Älteste zuerst</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="show-archived"
            checked={showArchived}
            onCheckedChange={(checked) => setShowArchived(!!checked)}
          />
          <Label htmlFor="show-archived" className="cursor-pointer">
            Archivierte anzeigen
          </Label>
        </div>
      </div>

      {/* Active filters indicator */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {filteredProjects.length} Ergebnis{filteredProjects.length !== 1 ? "se" : ""}
            {searchQuery && ` für "${searchQuery}"`}
          </span>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Alle Filter löschen
            </Button>
          )}
        </div>
      )}

      {/* Projects Grid */}
      <ProjectGrid
        projects={filteredProjects}
        onCreateNew={() => router.push("/projects/new")}
        onRename={(id) => console.log("Rename project:", id)}
        onEditTags={(id) => console.log("Edit tags:", id)}
        onArchive={(id) => console.log("Archive project:", id)}
        onDelete={(id) => console.log("Delete project:", id)}
      />
    </div>
  );
}
