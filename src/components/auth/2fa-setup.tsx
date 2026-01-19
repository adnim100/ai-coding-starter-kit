"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Copy, Check, Loader2 } from "lucide-react";
import Image from "next/image";

const verifyCodeSchema = z.object({
  code: z.string().length(6, "Code muss 6 Zeichen lang sein").regex(/^\d+$/, "Code muss nur Zahlen enthalten"),
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

interface TwoFactorSetupProps {
  qrCodeUrl?: string;
  manualEntryCode?: string;
  onVerify?: (code: string) => Promise<{ success: boolean; error?: string }>;
}

export function TwoFactorSetup({ qrCodeUrl, manualEntryCode, onVerify }: TwoFactorSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const form = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleVerifySubmit = async (data: VerifyCodeFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await onVerify?.(data.code);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyManualCode = async () => {
    if (manualEntryCode) {
      await navigator.clipboard.writeText(manualEntryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2FA einrichten</CardTitle>
        <CardDescription>
          Sichere deinen Account mit Two-Factor Authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Schritt 1: QR-Code scannen</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Scanne diesen QR-Code mit deiner Authenticator App (Google Authenticator, Authy, 1Password, etc.)
            </p>
            {qrCodeUrl && (
              <div className="flex justify-center bg-white p-4 rounded-lg border">
                <Image
                  src={qrCodeUrl}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                  className="rounded"
                />
              </div>
            )}
          </div>

          {manualEntryCode && (
            <div>
              <h3 className="font-semibold mb-2">Manuelle Eingabe (Alternative)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Falls der QR-Code-Scan nicht funktioniert, gib diesen Code manuell in deine App ein:
              </p>
              <div className="flex gap-2">
                <Input
                  value={manualEntryCode}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyManualCode}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-2">Schritt 2: Code verifizieren</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerifySubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>6-stelliger Code aus deiner App</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        disabled={isLoading}
                        autoComplete="one-time-code"
                      />
                    </FormControl>
                    <FormDescription>
                      Gib den aktuellen 6-stelligen Code aus deiner Authenticator App ein
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                2FA aktivieren
              </Button>
            </form>
          </Form>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nach der Aktivierung erhältst du Recovery Codes. Bewahre diese sicher auf!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
