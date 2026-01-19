"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TwoFactorSetup } from "@/components/auth/2fa-setup";
import { RecoveryCodes } from "@/components/auth/recovery-codes";

export default function Setup2FAPage() {
  const router = useRouter();
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

  // TODO: Fetch these from API after user is authenticated
  const [qrCodeUrl] = useState("/api/auth/2fa/qr-code"); // Placeholder
  const [manualEntryCode] = useState("JBSWY3DPEHPK3PXP"); // Placeholder
  const [recoveryCodes] = useState([
    "ABCD-1234",
    "EFGH-5678",
    "IJKL-9012",
    "MNOP-3456",
    "QRST-7890",
    "UVWX-1234",
    "YZAB-5678",
    "CDEF-9012",
    "GHIJ-3456",
    "KLMN-7890",
  ]);

  const handleVerify = async (code: string) => {
    // TODO: Implement API call to verify 2FA code
    // const response = await fetch("/api/auth/2fa/verify", {
    //   method: "POST",
    //   body: JSON.stringify({ code }),
    // });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate success
    if (code.length === 6) {
      setShowRecoveryCodes(true);
      return { success: true };
    }

    return { success: false, error: "Code ungültig. Bitte versuche es erneut." };
  };

  const handleConfirmRecoveryCodes = () => {
    // TODO: Mark recovery codes as confirmed in backend
    // Redirect to dashboard or onboarding
    router.push("/dashboard");
  };

  if (showRecoveryCodes) {
    return (
      <RecoveryCodes
        codes={recoveryCodes}
        onConfirm={handleConfirmRecoveryCodes}
      />
    );
  }

  return (
    <TwoFactorSetup
      qrCodeUrl={qrCodeUrl}
      manualEntryCode={manualEntryCode}
      onVerify={handleVerify}
    />
  );
}
