"use client";

import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DocumentStatus } from "../_lib/types";

export type StatusFilter = "ALL" | DocumentStatus;
export type SortOrder = "newest" | "oldest" | "name";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PROCESSED", label: "Ready" },
  { value: "UPLOADED", label: "Processing" },
  { value: "FAILED", label: "Failed" },
];

const SORT_LABEL: Record<SortOrder, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  name: "Name (A–Z)",
};

interface DocumentsToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sort: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  counts: Record<StatusFilter, number>;
}

export function DocumentsToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  counts,
}: DocumentsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div
        role="radiogroup"
        aria-label="Filter by status"
        className="flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1"
      >
        {STATUS_FILTERS.map((filter) => {
          const active = status === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onStatusChange(filter.value)}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                active
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
              <span className="tabular-nums text-muted-foreground">{counts[filter.value]}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 md:w-64 md:flex-none">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by name..."
            aria-label="Search documents"
            className="h-8 pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Clear search"
              className="absolute top-1/2 right-1 -translate-y-1/2"
              onClick={() => onQueryChange("")}
            >
              <XIcon />
            </Button>
          ) : null}
        </div>

        <Select value={sort} onValueChange={(value) => value && onSortChange(value as SortOrder)}>
          <SelectTrigger className="w-40" aria-label="Sort documents">
            <SelectValue>{(value: SortOrder) => SORT_LABEL[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABEL) as SortOrder[]).map((value) => (
              <SelectItem key={value} value={value}>
                {SORT_LABEL[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
