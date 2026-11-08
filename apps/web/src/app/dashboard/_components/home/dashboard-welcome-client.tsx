import Link from "next/link";
import { FilePlus2, MessageSquareText, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardWelcomeClientProps {
  userName?: string;
}

export function DashboardWelcomeClient({ userName }: DashboardWelcomeClientProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm md:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="size-4" />
            Document analysis workspace
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back{userName ? `, ${userName}` : ""}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Upload documents, run structured analyses, and chat with your files.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/dashboard/documents" />}>
            <Upload />
            Upload
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/dashboard/analyses" />}
          >
            <FilePlus2 />
            New analysis
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/dashboard/chat" />}
          >
            <MessageSquareText />
            Ask the chat
          </Button>
        </div>
      </div>
    </section>
  );
}
