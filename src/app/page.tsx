import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Zap, GitCompare, Download, Shield, Database } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Mic className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">ProjectHub</h1>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold mb-6">
            Compare Audio Transcription Providers
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Upload your audio files and compare results from 9 leading AI transcription services side-by-side.
            Find the best provider for accuracy, speed, and cost.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>9 AI Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Compare OpenAI Whisper, AssemblyAI, Deepgram, Google Speech, AWS Transcribe,
                ElevenLabs, Gladia, Speechmatics, and OpenRouter.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <GitCompare className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Side-by-Side Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View results in multiple formats: side-by-side, diff view with highlighting,
                or metrics table for detailed analysis.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Export Anywhere</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Export transcripts as TXT, JSON, CSV, or professional PDF reports.
                Perfect for documentation and sharing.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Project Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize your transcriptions in projects. Track progress, add tags,
                and manage multiple audio files effortlessly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bank-level encryption for API keys. Two-factor authentication.
                Your data is protected with enterprise-grade security.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Mic className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Advanced Features</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Speaker diarization, timestamps, confidence scores, and audio player
                with click-to-jump navigation.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-primary/10 rounded-lg p-12">
          <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-lg text-muted-foreground mb-6">
            Create your free account and start comparing transcription providers today.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-muted-foreground">
          <p>© 2026 ProjectHub. Built with Next.js and AI.</p>
        </div>
      </footer>
    </div>
  )
}
