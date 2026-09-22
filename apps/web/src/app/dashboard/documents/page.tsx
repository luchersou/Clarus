import { Suspense } from "react";
import { DocumentUploadPanel } from "./_components/document-upload-panel";
import { DocumentsList } from "./_components/documents-list";

export default function DocumentsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Upload files and manage the documents ready for analysis.
        </p>
      </div>

      <DocumentUploadPanel />

      <Suspense fallback={<div>Loading...</div>}>
        <DocumentsList />
      </Suspense>
    </div>
  );
}