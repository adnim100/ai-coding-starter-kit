"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
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
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(12, "Passwort muss mindestens 12 Zeichen lang sein")
    .regex(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten")
    .regex(/[a-z]/, "Passwort muss mindestens einen Kleinbuchstaben enthalten")
    .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten")
    .regex(/[^A-Za-z0-9]/, "Passwort muss mindestens ein Sonderzeichen enthalten"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

const twoFactorSchema = z.object({
  code: z.string().length(6, "Code muss 6 Zeichen lang sein"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState<string>("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const twoFactorForm = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: "",
    },
  });

  const password = resetForm.watch("password");

  const passwordRequirements = [
    { label: "Mindestens 12 Zeichen", met: password.length >= 12 },
    { label: "Mindestens 1 Großbuchstabe", met: /[A-Z]/.test(password) },
    { label: "Mindestens 1 Kleinbuchstabe", met: /[a-z]/.test(password) },
    { label: "Mindestens 1 Zahl", met: /[0-9]/.test(password) },
    { label: "Mindestens 1 Sonderzeichen", met: /[^A-Za-z0-9]/.test(password) },
  ];

  useEffect(() => {
    // Validate token on mount
    const validateToken = async () => {
      setIsValidating(true);
      try {
        // TODO: Implement API call to validate token
        // const response = await fetch(`/api/auth/reset-password/validate?token=${token}`);
        // const data = await response.json();

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate validation - in real app, check token validity
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
        setError("Link ungültig oder abgelaufen. Bitte fordere einen neuen an.");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleResetSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // TODO: Implement API call to reset password
      // const response = await fetch("/api/auth/reset-password", {
      //   method: "POST",
      //   body: JSON.stringify({ token, password: data.password }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if user has 2FA enabled
      const has2FA = true; // Simulate - get from API response

      if (has2FA) {
        setRequires2FA(true);
      } else {
        setResetSuccess(true);
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (data: TwoFactorFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // TODO: Implement API call to verify 2FA and complete reset
      // const response = await fetch("/api/auth/reset-password/verify-2fa", {
      //   method: "POST",
      //   body: JSON.stringify({ token, code: data.code }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setResetSuccess(true);
    } catch (err) {
      setError("Code ungültig. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Link wird überprüft...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tokenValid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Link ungültig</CardTitle>
          <CardDescription className="text-center">
            Der Reset-Link ist ungültig oder abgelaufen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Link ungültig oder abgelaufen. Bitte fordere einen neuen an."}
            </AlertDescription>
          </Alert>

          <Link href="/forgot-password">
            <Button className="w-full">
              Neuen Link anfordern
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="outline" className="w-full">
              Zum Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (resetSuccess) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
          </div>
          <CardTitle className="text-center">Passwort erfolgreich geändert!</CardTitle>
          <CardDescription className="text-center">
            Du kannst dich jetzt mit deinem neuen Passwort einloggen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aus Sicherheitsgründen wurden alle deine aktiven Sessions beendet.
              Bitte logge dich erneut ein.
            </AlertDescription>
          </Alert>

          <Link href="/login">
            <Button className="w-full">
              Zum Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (requires2FA) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>2FA-Code eingeben</CardTitle>
          <CardDescription>
            {useRecoveryCode
              ? "Gib deinen 8-stelligen Recovery Code ein"
              : "Gib den 6-stelligen Code aus deiner Authenticator App ein"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...twoFactorForm}>
            <form onSubmit={twoFactorForm.handleSubmit(handle2FASubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={twoFactorForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {useRecoveryCode ? "Recovery Code" : "2FA-Code"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder={useRecoveryCode ? "XXXX-XXXX" : "123456"}
                        maxLength={useRecoveryCode ? 9 : 6}
                        className="text-center text-lg tracking-widest"
                        disabled={isLoading}
                        autoComplete="one-time-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Bestätigen
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setUseRecoveryCode(!useRecoveryCode)}
              >
                {useRecoveryCode
                  ? "2FA-Code verwenden"
                  : "Code nicht verfügbar? Recovery Code verwenden"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neues Passwort setzen</CardTitle>
        <CardDescription>
          Wähle ein sicheres neues Passwort für deinen Account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={resetForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neues Passwort</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormDescription>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-semibold">Passwort-Anforderungen:</p>
                      {passwordRequirements.map((req, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 text-xs ${
                            req.met ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
                          }`}
                        >
                          <CheckCircle2
                            className={`h-3 w-3 ${
                              req.met ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
                            }`}
                          />
                          {req.label}
                        </div>
                      ))}
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={resetForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passwort bestätigen</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Passwort ändern
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
