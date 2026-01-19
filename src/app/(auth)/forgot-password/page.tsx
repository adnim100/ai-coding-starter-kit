"use client";

import { useState } from "react";
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
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Bitte gib eine gültige Email-Adresse ein"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>("");

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // TODO: Implement API call to request password reset
      // const response = await fetch("/api/auth/forgot-password", {
      //   method: "POST",
      //   body: JSON.stringify(data),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Always show success message (security: prevent email enumeration)
      setSubmitted(true);
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
          </div>
          <CardTitle className="text-center">Email gesendet</CardTitle>
          <CardDescription className="text-center">
            Überprüfe dein Postfach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Falls ein Account mit dieser Email existiert, haben wir dir einen Link zum Zurücksetzen
              deines Passworts gesendet. Der Link ist 1 Stunde gültig.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Email nicht erhalten?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Überprüfe deinen Spam-Ordner</li>
              <li>Stelle sicher, dass die Email-Adresse korrekt ist</li>
              <li>Warte ein paar Minuten und versuche es erneut</li>
            </ul>
          </div>

          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passwort zurücksetzen</CardTitle>
        <CardDescription>
          Gib deine Email-Adresse ein, um einen Reset-Link zu erhalten
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@beispiel.de"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormDescription>
                    Wir senden dir einen Link zum Zurücksetzen deines Passworts
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset-Link senden
            </Button>

            <Link href="/login">
              <Button variant="link" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zum Login
              </Button>
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
