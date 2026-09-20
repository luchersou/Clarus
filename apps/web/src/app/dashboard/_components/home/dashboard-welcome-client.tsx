import Link from "next/link";
import { Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardWelcomeClientProps {
  userName?: string;
}

export function DashboardWelcomeClient({ userName }: DashboardWelcomeClientProps) {
  return (
    <div className="rounded-sm border bg-card p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-4 w-4" />
            Document analysis workspace
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Welcome back{userName ? `, ${userName}` : ""}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Upload documents, run structured analyses, and chat with your files.
          </p>
        </div>
        <div className="flex w-full max-w-44 shrink-0 flex-col gap-3">
          <Button
            nativeButton={false}
            className="w-full"
            render={<Link href="/dashboard/documents" />}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload document
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            className="w-full"
            render={<Link href="/dashboard/analyses" />}
          >
            New analysis
          </Button>
        </div>
      </div>
    </div>
  );
}