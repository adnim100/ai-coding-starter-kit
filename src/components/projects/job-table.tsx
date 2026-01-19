"use client";

import { Clock, CheckCircle2, XCircle, Loader2, Eye, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TranscriptionJob, JobStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface JobTableProps {
  jobs: TranscriptionJob[];
  onViewTranscript?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
}

const statusConfig: Record<JobStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  queued: {
    label: "Queued",
    icon: Clock,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
  }
};

export function JobTable({
  jobs,
  onViewTranscript,
  onViewDetails,
  onCancel
}: JobTableProps) {
  const formatTimestamp = (date?: Date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDuration = (job: TranscriptionJob) => {
    if (!job.startedAt || !job.completedAt) return undefined;
    const start = new Date(job.startedAt).getTime();
    const end = new Date(job.completedAt).getTime();
    return (end - start) / 1000;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Gestartet</TableHead>
            <TableHead>Dauer</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Noch keine Transkriptions-Jobs gestartet
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => {
              const config = statusConfig[job.status];
              const Icon = config.icon;
              const duration = job.duration || calculateDuration(job);

              return (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.providerName}</TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", config.className)}>
                      <Icon className={cn("h-3 w-3", job.status === 'processing' && "animate-spin")} />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatTimestamp(job.startedAt)}</TableCell>
                  <TableCell>{formatDuration(duration)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {job.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewTranscript?.(job.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Transkript
                        </Button>
                      )}
                      {job.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails?.(job.id)}
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      )}
                      {job.status === 'processing' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCancel?.(job.id)}
                        >
                          Abbrechen
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
