import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { Settings, LayoutDashboard, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xl font-bold">
                ProjectHub
              </Link>
              <nav className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Einstellungen
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/api/auth/signout"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Link>
            </div>
          </div>
        </div>
      </header>
      {children}
      <Toaster />
    </div>
  );
}
