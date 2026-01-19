"use client";

import { Project } from "@/lib/types";
import { ProjectCard } from "./project-card";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectGridProps {
  projects: Project[];
  onRename?: (id: string) => void;
  onEditTags?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreateNew?: () => void;
}

export function ProjectGrid({
  projects,
  onRename,
  onEditTags,
  onArchive,
  onDelete,
  onCreateNew
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Noch keine Projekte vorhanden</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Erstellen Sie Ihr erstes Projekt, um mit der Transkription zu beginnen.
        </p>
        <Button onClick={onCreateNew} size="lg">
          Erstes Projekt erstellen
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onRename={onRename}
          onEditTags={onEditTags}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
