import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            ProjectHub
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Audio Transcription Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
