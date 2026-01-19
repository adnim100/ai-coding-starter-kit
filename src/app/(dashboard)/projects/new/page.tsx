"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TagEditor } from "@/components/projects/tag-editor";
import { toast } from "sonner";

const availableTags = ["Interview", "Meeting", "Podcast", "Deutsch", "Englisch", "Telefonat", "Konferenz"];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Bitte geben Sie einen Projekt-Namen ein");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Erstellen des Projekts");
      }

      toast.success("Projekt erfolgreich erstellt!");
      router.push(`/projects/${data.project.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(error instanceof Error ? error.message : "Fehler beim Erstellen des Projekts");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Neues Projekt erstellen</h1>
          <p className="text-muted-foreground mt-1">
            Erstellen Sie ein neues Transkriptions-Projekt
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Projekt-Details</CardTitle>
          <CardDescription>
            Geben Sie die grundlegenden Informationen für Ihr neues Projekt ein
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Projekt-Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="z.B. Interview mit CEO"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <Textarea
                id="description"
                placeholder="Eine kurze Beschreibung des Projekts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags (optional)</Label>
              <p className="text-sm text-muted-foreground">
                Fügen Sie Tags hinzu, um Ihre Projekte zu organisieren
              </p>
              <TagEditor
                tags={tags}
                availableTags={availableTags}
                onTagsChange={setTags}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex-1"
              >
                {isSubmitting ? "Erstelle..." : "Projekt erstellen und Audio hochladen"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Was passiert als Nächstes?</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Projekt wird erstellt und gespeichert</li>
            <li>Sie werden zur Upload-Seite weitergeleitet</li>
            <li>Laden Sie Audio-Dateien hoch</li>
            <li>Wählen Sie Transkriptions-Provider aus</li>
            <li>Starten Sie die Transkription</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
