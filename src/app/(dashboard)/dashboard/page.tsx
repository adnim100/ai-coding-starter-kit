"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowUpDown, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showArchived, setShowArchived] = useState(false);

  // Fetch projects from API
  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (showArchived) params.set('archived', 'true');

        const response = await fetch(`/api/projects?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Fehler beim Laden der Projekte");
        }
        const data = await response.json();

        // Map API response to Project type
        const mappedProjects: Project[] = (data.projects || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          status: p.status?.toLowerCase() || "pending",
          tags: p.tags || [],
          audioFiles: (p.audio_files || []).map((af: any) => ({
            id: af.id,
            name: af.filename,
            size: af.file_size || 0,
            duration: af.duration_seconds || 0,
            type: af.mime_type?.split('/')[1] || "audio",
            url: af.storage_path || "",
            uploadedAt: new Date(af.created_at)
          })),
          jobs: (p.transcription_jobs || []).map((job: any) => ({
            id: job.id,
            providerId: job.provider?.toLowerCase() || "unknown",
            providerName: job.provider || "Unknown",
            status: job.status?.toLowerCase() || "pending",
            startedAt: job.started_at ? new Date(job.started_at) : undefined,
            completedAt: job.completed_at ? new Date(job.completed_at) : undefined,
            duration: job.processing_time_ms ? job.processing_time_ms / 1000 : undefined
          })),
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at || p.created_at),
          isArchived: p.archived || false,
          totalCost: p.total_cost
        }));

        setProjects(mappedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Fehler beim Laden der Projekte");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, [showArchived]);

  // Get all available tags from projects
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    projects.forEach(project => {
      project.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

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
  }, [projects, searchQuery, selectedStatuses, selectedTags, sortBy]);

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSelectedTags([]);
    setSearchQuery("");
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Fehler beim Löschen");
      setProjects(projects.filter(p => p.id !== id));
      toast.success("Projekt gelöscht");
    } catch (error) {
      toast.error("Fehler beim Löschen des Projekts");
    }
  };

  const handleArchiveProject = async (id: string) => {
    try {
      const project = projects.find(p => p.id === id);
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !project?.isArchived })
      });
      if (!response.ok) throw new Error("Fehler beim Archivieren");
      setProjects(projects.map(p =>
        p.id === id ? { ...p, isArchived: !p.isArchived } : p
      ));
      toast.success(project?.isArchived ? "Projekt wiederhergestellt" : "Projekt archiviert");
    } catch (error) {
      toast.error("Fehler beim Archivieren des Projekts");
    }
  };

  const activeFilterCount = selectedStatuses.length + selectedTags.length;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

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
        onRename={(id) => router.push(`/projects/${id}`)}
        onEditTags={(id) => router.push(`/projects/${id}`)}
        onArchive={handleArchiveProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
}
