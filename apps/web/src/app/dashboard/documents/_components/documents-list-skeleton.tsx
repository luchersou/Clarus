import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DocumentsListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-9 w-80 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 md:w-64 md:flex-none" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Size</TableHead>
              <TableHead className="hidden sm:table-cell">Uploaded</TableHead>
              <TableHead className="pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 shrink-0 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-14" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="size-7" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
