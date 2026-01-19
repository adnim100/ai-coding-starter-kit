'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle, XCircle, Clock, Zap, FileText, DollarSign } from 'lucide-react'

interface TranscriptMetrics {
  id: string
  provider: string
  status: string
  processingTimeMs: number
  confidence?: number
  wordCount: number
  costUsd?: number
  language: string
  hasDiarization: boolean
  hasTimestamps: boolean
  errorMessage?: string
}

interface TableViewProps {
  metrics: TranscriptMetrics[]
}

export function TableView({ metrics }: TableViewProps) {
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatCost = (usd?: number) => {
    if (!usd) return 'N/A'
    return `$${usd.toFixed(4)}`
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; color: string }> = {
      COMPLETED: {
        variant: 'default',
        icon: CheckCircle,
        color: 'text-green-500',
      },
      FAILED: {
        variant: 'destructive',
        icon: XCircle,
        color: 'text-red-500',
      },
      PROCESSING: {
        variant: 'secondary',
        icon: Clock,
        color: 'text-blue-500',
      },
    }

    const config = variants[status] || variants.PROCESSING
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  // Calculate averages
  const completed = metrics.filter((m) => m.status === 'COMPLETED')
  const avgTime =
    completed.length > 0
      ? completed.reduce((acc, m) => acc + m.processingTimeMs, 0) / completed.length
      : 0
  const avgConfidence =
    completed.filter((m) => m.confidence).length > 0
      ? completed.reduce((acc, m) => acc + (m.confidence || 0), 0) /
        completed.filter((m) => m.confidence).length
      : 0
  const totalCost = metrics.reduce((acc, m) => acc + (m.costUsd || 0), 0)

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Completed</span>
          </div>
          <p className="text-2xl font-bold">
            {completed.length}/{metrics.length}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Avg Time</span>
          </div>
          <p className="text-2xl font-bold">{formatTime(avgTime)}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">Avg Confidence</span>
          </div>
          <p className="text-2xl font-bold">
            {avgConfidence > 0 ? `${(avgConfidence * 100).toFixed(0)}%` : 'N/A'}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Total Cost</span>
          </div>
          <p className="text-2xl font-bold">{formatCost(totalCost)}</p>
        </Card>
      </div>

      {/* Metrics Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Time</TableHead>
              <TableHead className="text-right">Confidence</TableHead>
              <TableHead className="text-right">Words</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-center">Features</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell className="font-medium">
                  {metric.provider.replace(/_/g, ' ')}
                </TableCell>
                <TableCell>{getStatusBadge(metric.status)}</TableCell>
                <TableCell className="text-right">
                  {formatTime(metric.processingTimeMs)}
                </TableCell>
                <TableCell className="text-right">
                  {metric.confidence
                    ? `${(metric.confidence * 100).toFixed(0)}%`
                    : '-'}
                </TableCell>
                <TableCell className="text-right">{metric.wordCount}</TableCell>
                <TableCell className="text-right">{formatCost(metric.costUsd)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {metric.hasDiarization && (
                      <Badge variant="outline" className="text-xs">
                        Speaker
                      </Badge>
                    )}
                    {metric.hasTimestamps && (
                      <Badge variant="outline" className="text-xs">
                        Time
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Errors */}
      {metrics.some((m) => m.errorMessage) && (
        <Card className="p-4 border-red-200 bg-red-50">
          <h3 className="font-semibold text-red-800 mb-2">Errors</h3>
          <div className="space-y-2">
            {metrics
              .filter((m) => m.errorMessage)
              .map((metric) => (
                <div key={metric.id} className="text-sm">
                  <span className="font-medium">{metric.provider}:</span>{' '}
                  <span className="text-red-700">{metric.errorMessage}</span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}
