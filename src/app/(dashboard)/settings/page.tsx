"use client";

import { useState, useEffect } from "react";
import { User, Bell, Key, Palette, Database, Loader2, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// All supported providers
const PROVIDERS = [
  { id: "OPENAI_WHISPER", name: "OpenAI Whisper", placeholder: "sk-...", description: "Für Whisper-Transkriptionen" },
  { id: "DEEPGRAM", name: "Deepgram", placeholder: "...", description: "Schnelle und genaue Transkription" },
  { id: "ASSEMBLYAI", name: "AssemblyAI", placeholder: "...", description: "Universal-Modell mit Diarization" },
  { id: "GOOGLE_SPEECH", name: "Google Speech-to-Text", placeholder: "...", description: "Google Cloud Speech API" },
  { id: "AWS_TRANSCRIBE", name: "AWS Transcribe", placeholder: "...", description: "Amazon Transcribe Service" },
  { id: "ELEVENLABS", name: "ElevenLabs", placeholder: "...", description: "ElevenLabs Speech-to-Text" },
  { id: "GLADIA", name: "Gladia", placeholder: "...", description: "Gladia API" },
  { id: "SPEECHMATICS", name: "Speechmatics", placeholder: "...", description: "Speechmatics API" },
];

interface ApiKeyState {
  [key: string]: {
    value: string;
    isConfigured: boolean;
    isSaving: boolean;
  };
}

export default function SettingsPage() {
  // Profile settings
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [jobCompletedNotif, setJobCompletedNotif] = useState(true);
  const [jobFailedNotif, setJobFailedNotif] = useState(true);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyState>({});
  const [loadingKeys, setLoadingKeys] = useState(true);

  // Appearance settings
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("de");

  // Load existing API keys on mount
  useEffect(() => {
    async function loadApiKeys() {
      try {
        const response = await fetch("/api/api-keys");
        if (response.ok) {
          const data = await response.json();
          const keysState: ApiKeyState = {};

          // Initialize all providers
          PROVIDERS.forEach(p => {
            keysState[p.id] = { value: "", isConfigured: false, isSaving: false };
          });

          // Mark configured providers
          data.apiKeys?.forEach((key: any) => {
            if (keysState[key.provider]) {
              keysState[key.provider].isConfigured = true;
              keysState[key.provider].value = "••••••••"; // Masked
            }
          });

          setApiKeys(keysState);
        }
      } catch (error) {
        console.error("Error loading API keys:", error);
      } finally {
        setLoadingKeys(false);
      }
    }
    loadApiKeys();
  }, []);

  const handleSaveApiKey = async (providerId: string) => {
    const keyValue = apiKeys[providerId]?.value;
    if (!keyValue || keyValue === "••••••••") {
      toast.error("Bitte geben Sie einen API-Schlüssel ein");
      return;
    }

    setApiKeys(prev => ({
      ...prev,
      [providerId]: { ...prev[providerId], isSaving: true }
    }));

    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: providerId,
          apiKey: keyValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern");
      }

      setApiKeys(prev => ({
        ...prev,
        [providerId]: { value: "••••••••", isConfigured: true, isSaving: false }
      }));

      toast.success("API-Schlüssel gespeichert");
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Fehler beim Speichern des API-Schlüssels");
      setApiKeys(prev => ({
        ...prev,
        [providerId]: { ...prev[providerId], isSaving: false }
      }));
    }
  };

  const handleDeleteApiKey = async (providerId: string) => {
    try {
      const response = await fetch(`/api/api-keys?provider=${providerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen");
      }

      setApiKeys(prev => ({
        ...prev,
        [providerId]: { value: "", isConfigured: false, isSaving: false }
      }));

      toast.success("API-Schlüssel gelöscht");
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Fehler beim Löschen des API-Schlüssels");
    }
  };

  const handleSaveProfile = () => {
    toast.success("Profil aktualisiert");
  };

  const handleSaveNotifications = () => {
    toast.success("Benachrichtigungseinstellungen gespeichert");
  };

  const handleSaveAppearance = () => {
    toast.success("Einstellungen gespeichert");
  };

  const handleExportData = () => {
    toast.success("Daten werden exportiert...");
  };

  const handleDeleteAccount = () => {
    toast.error("Account-Löschung erfordert Bestätigung");
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground mt-1">
          Verwalten Sie Ihre Account-Einstellungen und Präferenzen
        </p>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Benachrichtigungen</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API-Keys</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Darstellung</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Daten</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil-Informationen</CardTitle>
              <CardDescription>
                Aktualisieren Sie Ihre persönlichen Informationen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ihr Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.de"
                />
              </div>

              <Button onClick={handleSaveProfile}>Änderungen speichern</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passwort ändern</CardTitle>
              <CardDescription>
                Aktualisieren Sie Ihr Passwort
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Aktuelles Passwort</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Neues Passwort</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button>Passwort aktualisieren</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungseinstellungen</CardTitle>
              <CardDescription>
                Wählen Sie, welche Benachrichtigungen Sie erhalten möchten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-Mail-Benachrichtigungen</Label>
                  <p className="text-sm text-muted-foreground">
                    Erhalten Sie E-Mails über wichtige Updates
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Job abgeschlossen</Label>
                  <p className="text-sm text-muted-foreground">
                    Benachrichtigung wenn ein Transkriptions-Job abgeschlossen ist
                  </p>
                </div>
                <Switch
                  checked={jobCompletedNotif}
                  onCheckedChange={setJobCompletedNotif}
                  disabled={!emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Job fehlgeschlagen</Label>
                  <p className="text-sm text-muted-foreground">
                    Benachrichtigung wenn ein Transkriptions-Job fehlschlägt
                  </p>
                </div>
                <Switch
                  checked={jobFailedNotif}
                  onCheckedChange={setJobFailedNotif}
                  disabled={!emailNotifications}
                />
              </div>

              <Button onClick={handleSaveNotifications}>Einstellungen speichern</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API-Schlüssel für Transkriptions-Provider</CardTitle>
              <CardDescription>
                Hinterlegen Sie Ihre API-Schlüssel, um verschiedene Transkriptions-Provider zu nutzen.
                Die Schlüssel werden verschlüsselt gespeichert.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingKeys ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                PROVIDERS.map((provider) => (
                  <div key={provider.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={provider.id}>{provider.name}</Label>
                      {apiKeys[provider.id]?.isConfigured && (
                        <Badge variant="secondary" className="gap-1">
                          <Check className="h-3 w-3" />
                          Konfiguriert
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id={provider.id}
                        type="password"
                        value={apiKeys[provider.id]?.value || ""}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          [provider.id]: { ...prev[provider.id], value: e.target.value }
                        }))}
                        placeholder={provider.placeholder}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleSaveApiKey(provider.id)}
                        disabled={apiKeys[provider.id]?.isSaving}
                        size="sm"
                      >
                        {apiKeys[provider.id]?.isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Speichern"
                        )}
                      </Button>
                      {apiKeys[provider.id]?.isConfigured && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteApiKey(provider.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {provider.description}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Darstellungseinstellungen</CardTitle>
              <CardDescription>
                Passen Sie das Aussehen der Anwendung an
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Hell</SelectItem>
                    <SelectItem value="dark">Dunkel</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Sprache</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveAppearance}>Einstellungen speichern</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daten exportieren</CardTitle>
              <CardDescription>
                Laden Sie eine Kopie Ihrer Daten herunter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Exportieren Sie alle Ihre Projekte, Transkripte und Einstellungen als JSON-Datei.
              </p>
              <Button onClick={handleExportData}>Daten exportieren</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible Aktionen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account löschen</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Löschen Sie Ihren Account permanent. Diese Aktion kann nicht rückgängig gemacht werden.
                  Alle Ihre Projekte, Transkripte und Daten werden unwiderruflich gelöscht.
                </p>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Account löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
