"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Download, Printer, Copy, Check } from "lucide-react";

interface RecoveryCodesProps {
  codes: string[];
  onConfirm?: () => void;
}

export function RecoveryCodes({ codes, onConfirm }: RecoveryCodesProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const content = `ProjectHub Recovery Codes
Generiert am: ${new Date().toLocaleString('de-DE')}

⚠️ WICHTIG: Bewahre diese Codes sicher auf!
- Jeder Code kann nur einmal verwendet werden
- Du benötigst sie, wenn du keinen Zugriff auf deine Authenticator App hast

Recovery Codes:
${codes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

Bewahre diese Codes an einem sicheren Ort auf (z.B. Password Manager).
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projecthub-recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ProjectHub Recovery Codes</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { font-size: 24px; margin-bottom: 10px; }
              .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
              .codes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
              .code { font-family: monospace; font-size: 14px; padding: 10px; background: #f3f4f6; border-radius: 4px; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <h1>ProjectHub Recovery Codes</h1>
            <p>Generiert am: ${new Date().toLocaleString('de-DE')}</p>
            <div class="warning">
              <strong>⚠️ WICHTIG:</strong>
              <ul>
                <li>Bewahre diese Codes sicher auf!</li>
                <li>Jeder Code kann nur einmal verwendet werden</li>
                <li>Du benötigst sie, wenn du keinen Zugriff auf deine Authenticator App hast</li>
              </ul>
            </div>
            <div class="codes">
              ${codes.map((code, i) => `<div class="code">${i + 1}. ${code}</div>`).join('')}
            </div>
            <div class="footer">
              Bewahre diese Codes an einem sicheren Ort auf (z.B. Password Manager oder Safe).
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopyAll = async () => {
    const text = codes.join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recovery Codes</CardTitle>
        <CardDescription>
          Speichere diese Codes sicher. Du benötigst sie, falls du keinen Zugriff auf deine Authenticator App hast.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="default" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900 dark:text-orange-200">
            <strong>Wichtig:</strong> Jeder Code kann nur einmal verwendet werden. Bewahre sie sicher auf!
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-3">
          {codes.map((code, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-sm"
            >
              <span className="text-muted-foreground">{index + 1}.</span>
              <span className="font-semibold">{code}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Herunterladen
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="flex-1"
          >
            <Printer className="mr-2 h-4 w-4" />
            Drucken
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyAll}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Kopiert
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Kopieren
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="confirm"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked as boolean)}
          />
          <Label
            htmlFor="confirm"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Ich habe die Codes sicher gespeichert
          </Label>
        </div>
        <Button
          onClick={onConfirm}
          disabled={!confirmed}
          className="w-full"
        >
          Weiter
        </Button>
      </CardFooter>
    </Card>
  );
}
