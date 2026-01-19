"use client";

import { useState } from "react";
import { Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@/lib/types";

interface FilterDropdownProps {
  availableTags: string[];
  selectedStatuses: ProjectStatus[];
  selectedTags: string[];
  onStatusChange: (statuses: ProjectStatus[]) => void;
  onTagChange: (tags: string[]) => void;
  onClearAll: () => void;
}

const statusLabels: Record<ProjectStatus, string> = {
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  partial: "Partial"
};

export function FilterDropdown({
  availableTags,
  selectedStatuses,
  selectedTags,
  onStatusChange,
  onTagChange,
  onClearAll
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const activeFilterCount = selectedStatuses.length + selectedTags.length;

  const toggleStatus = (status: ProjectStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagChange([...selectedTags, tag]);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        {(Object.keys(statusLabels) as ProjectStatus[]).map((status) => (
          <DropdownMenuCheckboxItem
            key={status}
            checked={selectedStatuses.includes(status)}
            onCheckedChange={() => toggleStatus(status)}
          >
            {statusLabels[status]}
          </DropdownMenuCheckboxItem>
        ))}

        {availableTags.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Tags</DropdownMenuLabel>
            {availableTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        )}

        {activeFilterCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onClearAll();
                setOpen(false);
              }}
            >
              Alle Filter löschen
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
