"use client";

import Link from "next/link";
import { MoreVertical, Folder, Clock, FileAudio } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Project, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onRename?: (id: string) => void;
  onEditTags?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  pending: {
    label: "Ausstehend",
    variant: "outline",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
  },
  processing: {
    label: "In Bearbeitung",
    variant: "secondary",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
  },
  completed: {
    label: "Abgeschlossen",
    variant: "default",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
  },
  failed: {
    label: "Fehlgeschlagen",
    variant: "destructive",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
  },
  partial: {
    label: "Teilweise",
    variant: "outline",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
  }
};

const defaultStatus = {
  label: "Unbekannt",
  variant: "outline" as const,
  className: "bg-gray-100 text-gray-800"
};

export function ProjectCard({
  project,
  onRename,
  onEditTags,
  onArchive,
  onDelete
}: ProjectCardProps) {
  const completedJobs = project.jobs.filter(j => j.status === 'completed').length;
  const totalJobs = project.jobs.length;
  const progressPercentage = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

  const statusInfo = statusConfig[project.status] || defaultStatus;
  const displayedFiles = project.audioFiles.slice(0, 3);
  const remainingFiles = project.audioFiles.length - 3;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{project.name}</h3>
            <Badge className={cn("mt-2", statusInfo.className)}>
              {statusInfo.label}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRename?.(project.id)}>
                Umbenennen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditTags?.(project.id)}>
                Tags bearbeiten
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onArchive?.(project.id)}>
                {project.isArchived ? "Dearchivieren" : "Archivieren"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(project.id)}
                className="text-destructive"
              >
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Audio files */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileAudio className="h-4 w-4" />
            <span>Audio-Dateien</span>
          </div>
          <div className="text-sm">
            {displayedFiles.map((file) => (
              <div key={file.id} className="truncate">
                {file.name}
              </div>
            ))}
            {remainingFiles > 0 && (
              <div className="text-muted-foreground">
                +{remainingFiles} weitere
              </div>
            )}
          </div>
        </div>

        {/* Progress bar for processing projects */}
        {project.status === 'processing' && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fortschritt</span>
              <span className="font-medium">
                {completedJobs} von {totalJobs} Provider
              </span>
            </div>
            <Progress value={progressPercentage} />
          </div>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileAudio className="h-3 w-3" />
            {project.audioFiles.length}
          </div>
          <div className="flex items-center gap-1">
            <Folder className="h-3 w-3" />
            {project.jobs.length} Provider
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(project.createdAt)}
          </div>
        </div>
        <Link href={`/projects/${project.id}`}>
          <Button size="sm">Öffnen</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
