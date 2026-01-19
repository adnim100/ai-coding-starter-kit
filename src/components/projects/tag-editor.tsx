"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TagEditorProps {
  tags: string[];
  availableTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagEditor({ tags, availableTags, onTagsChange }: TagEditorProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const addTag = (tagToAdd: string) => {
    const trimmedTag = tagToAdd.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue("");
      setOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  // Filter available tags to show only those not already selected
  const suggestedTags = availableTags.filter(tag => !tags.includes(tag));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </Button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Tag hinzufügen
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Tag suchen oder erstellen..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              {inputValue && !suggestedTags.some(tag => tag.toLowerCase() === inputValue.toLowerCase()) && (
                <CommandGroup heading="Neu erstellen">
                  <CommandItem
                    onSelect={() => addTag(inputValue)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    "{inputValue}" erstellen
                  </CommandItem>
                </CommandGroup>
              )}
              {suggestedTags.length > 0 && (
                <CommandGroup heading="Vorhandene Tags">
                  {suggestedTags.map((tag) => (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => addTag(tag)}
                    >
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {suggestedTags.length === 0 && !inputValue && (
                <CommandEmpty>Keine Tags verfügbar</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
