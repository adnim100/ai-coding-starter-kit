"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit2, Trash2, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AudioList } from "@/components/projects/audio-list";
import { JobTable } from "@/components/projects/job-table";
import { TagEditor } from "@/components/projects/tag-editor";
import { Project } from "@/lib/types";
import { toast } from "sonner";

// Mock data - Replace with actual API call
const mockProject: Project = {
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
    },
    {
      id: "j3",
      providerId: "assemblyai",
      providerName: "AssemblyAI",
      status: "completed",
      startedAt: new Date("2025-01-15T10:00:00"),
      completedAt: new Date("2025-01-15T10:06:00"),
      duration: 360
    }
  ],
  createdAt: new Date("2025-01-15"),
  updatedAt: new Date("2025-01-15"),
  isArchived: false,
  totalCost: 1.25
};

const mockAvailableTags = ["Interview", "Meeting", "Podcast", "Deutsch", "Englisch"];

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    setProject(mockProject);
    setEditedName(mockProject.name);
  }, [projectId]);

  const handleSaveName = () => {
    if (editedName.trim() && project) {
      setProject({ ...project, name: editedName.trim() });
      setIsEditing(false);
      toast.success("Projekt-Name aktualisiert");
    }
  };

  const handleUpdateTags = (newTags: string[]) => {
    if (project) {
      setProject({ ...project, tags: newTags });
      toast.success("Tags aktualisiert");
    }
  };

  const handleDeleteProject = () => {
    if (deleteConfirmation === "DELETE" && deleteAcknowledged) {
      // TODO: Replace with actual API call
      toast.success(`Projekt "${project?.name}" gelöscht`);
      router.push("/dashboard");
    }
  };

  const handleViewTranscript = (jobId: string) => {
    // TODO: Navigate to transcript view
    console.log("View transcript:", jobId);
  };

  const hasCompletedJobs = project?.jobs.some(j => j.status === 'completed');

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Projekt wird geladen...</div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditedName(project.name);
                    }
                  }}
                  autoFocus
                  className="max-w-md"
                />
                <Button onClick={handleSaveName} size="sm">Speichern</Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedName(project.name);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Abbrechen
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          {hasCompletedJobs && (
            <Button onClick={() => router.push(`/projects/${project.id}/compare`)}>
              <GitCompare className="h-4 w-4 mr-2" />
              Transkripte vergleichen
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Löschen
          </Button>
        </div>
      </div>

      <Separator />

      {/* Audio Files */}
      <Card>
        <CardHeader>
          <CardTitle>Audio-Dateien</CardTitle>
          <CardDescription>
            Verwalten Sie die Audio-Dateien für dieses Projekt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AudioList
            audioFiles={project.audioFiles}
            onDelete={(id) => console.log("Delete audio:", id)}
            onDownload={(id) => console.log("Download audio:", id)}
          />
        </CardContent>
      </Card>

      {/* Provider Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Transkriptions-Jobs</CardTitle>
          <CardDescription>
            Status aller Transkriptions-Provider für dieses Projekt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobTable
            jobs={project.jobs}
            onViewTranscript={handleViewTranscript}
            onViewDetails={(id) => console.log("View details:", id)}
            onCancel={(id) => console.log("Cancel job:", id)}
          />
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>
            Organisieren Sie Ihr Projekt mit Tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagEditor
            tags={project.tags}
            availableTags={mockAvailableTags}
            onTagsChange={handleUpdateTags}
          />
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Erstellt am:</span>
            <span className="font-medium">{formatDate(project.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Aktualisiert am:</span>
            <span className="font-medium">{formatDate(project.updatedAt)}</span>
          </div>
          {project.totalCost !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gesamtkosten:</span>
              <span className="font-medium">${project.totalCost.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Projekt-ID:</span>
            <span className="font-mono text-xs">{project.id}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="text-destructive">⚠️</span>
              Projekt unwiderruflich löschen?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Diese Aktion kann nicht rückgängig gemacht werden. Folgende Daten werden gelöscht:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{project.audioFiles.length} Audio-Datei{project.audioFiles.length !== 1 ? 'en' : ''}</li>
                  <li>{project.jobs.length} Transkript{project.jobs.length !== 1 ? 'e' : ''} (alle Provider)</li>
                  <li>Alle zugehörigen Kommentare</li>
                </ul>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="acknowledge"
                      checked={deleteAcknowledged}
                      onCheckedChange={(checked) => setDeleteAcknowledged(!!checked)}
                    />
                    <Label htmlFor="acknowledge" className="text-sm cursor-pointer">
                      Ich verstehe dass diese Aktion nicht rückgängig gemacht werden kann
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-delete">
                      Gib <strong>DELETE</strong> ein um zu bestätigen:
                    </Label>
                    <Input
                      id="confirm-delete"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                    />
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmation("");
              setDeleteAcknowledged(false);
            }}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deleteConfirmation !== "DELETE" || !deleteAcknowledged}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Projekt löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
