"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Document {
  id: string;
  fileName: string;
}

interface AnalysesFilterProps {
  documents: Document[];
}

const ALL_DOCUMENTS_VALUE = "all";

export function AnalysesFilter({ documents }: AnalysesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDocumentId = searchParams.get("documentId") ?? ALL_DOCUMENTS_VALUE;

  const handleChange = (value: string | null) => {
    if (!value || value === ALL_DOCUMENTS_VALUE) {
        router.push("/dashboard/analyses");
    } else {
        router.push(`/dashboard/analyses?documentId=${value}`);
    }
	};	

  return (
    <Select value={currentDocumentId} onValueChange={handleChange}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Filter by document" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_DOCUMENTS_VALUE}>All documents</SelectItem>
        {documents.map((doc) => (
          <SelectItem key={doc.id} value={doc.id}>
            {doc.fileName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}