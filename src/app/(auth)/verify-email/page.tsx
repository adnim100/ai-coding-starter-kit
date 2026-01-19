"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const maxResends = 3;

  const handleResendEmail = async () => {
    if (resendCount >= maxResends) {
      setError("Limit erreicht. Versuche es in 1 Stunde erneut.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Implement API call to resend verification email
      // const response = await fetch("/api/auth/resend-verification", {
      //   method: "POST",
      //   body: JSON.stringify({ email }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Verifizierungs-Email wurde erneut gesendet!");
      setResendCount(resendCount + 1);
    } catch (err) {
      setError("Fehler beim Senden der Email. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-center">Email verifizieren</CardTitle>
        <CardDescription className="text-center">
          Wir haben dir eine Email gesendet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Wir haben eine Verifizierungs-Email an
          </p>
          <p className="font-semibold">{email}</p>
          <p className="text-sm text-muted-foreground">
            gesendet. Bitte klicke auf den Link in der Email, um deine Email-Adresse zu bestätigen.
          </p>
        </div>

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full"
            disabled={isLoading || resendCount >= maxResends}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Email erneut senden
          </Button>

          {resendCount > 0 && resendCount < maxResends && (
            <p className="text-xs text-center text-muted-foreground">
              {resendCount} von {maxResends} Versuchen verwendet
            </p>
          )}
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Email nicht erhalten?</strong> Überprüfe deinen Spam-Ordner oder warte ein paar Minuten.
            Der Verifizierungs-Link ist 24 Stunden gültig.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
        <CardTitle className="text-center">Laden...</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
