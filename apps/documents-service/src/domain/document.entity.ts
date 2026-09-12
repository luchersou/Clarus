import { randomUUID } from "node:crypto";
import type { DocumentStatus } from "./document-status.js";
import type { FileType } from "./file-type.js";
import { InvalidDocumentTransitionError } from "./errors/invalid-document-transition.error.js";

export interface DocumentProps {
  id: string;
  userId: string;
  fileName: string;
  fileType: FileType;
  fileSizeBytes: number;
  storageUrl: string;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Document {
  private constructor(private props: DocumentProps) {}

  static create(input: {
    userId: string;
    fileName: string;
    fileType: FileType;
    fileSizeBytes: number;
    storageUrl: string;
  }): Document {
    const now = new Date();
    return new Document({
      id: randomUUID(),
      ...input,
      status: "UPLOADED",
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(props: DocumentProps): Document {
    return new Document(props);
  }

  markAsProcessed(): void {
    if (this.props.status !== "UPLOADED") {
      throw new InvalidDocumentTransitionError(
        this.props.status,
        "PROCESSED",
      );
    }

    this.props.status = "PROCESSED";
    this.props.updatedAt = new Date();
  }

  markAsFailed(): void {
    if (this.props.status === "PROCESSED") {
      throw new InvalidDocumentTransitionError(this.props.status, "FAILED");
    }
    this.props.status = "FAILED";
    this.props.updatedAt = new Date();
  }

  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get fileName() {
    return this.props.fileName;
  }
  get fileType() {
    return this.props.fileType;
  }
  get fileSizeBytes() {
    return this.props.fileSizeBytes;
  }
  get storageUrl() {
    return this.props.storageUrl;
  }
  get status() {
    return this.props.status;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}