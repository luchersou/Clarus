import { randomUUID } from "node:crypto";
import type { AnalysisStatus } from "./analysis-status.js";
import type { AnalysisType } from "./analysis-type.js";
import { InvalidAnalysisTransitionError } from "./errors/invalid-analysis-transition.error.js";

export interface AnalysisProps {
  id: string;
  documentId: string;
  userId: string;
  type: AnalysisType;
  status: AnalysisStatus;
  result: Record<string, unknown> | null;
  sourcePage: number | null;
  confidence: number | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
	deletedAt?: Date | null;
}

export class Analysis {
  private constructor(private props: AnalysisProps) {}

  static create(input: {
    documentId: string;
    userId: string;
    type: AnalysisType;
  }): Analysis {
    const now = new Date();
    return new Analysis({
      id: randomUUID(),
      documentId: input.documentId,
      userId: input.userId,
      type: input.type,
      status: "PENDING",
      result: null,
      sourcePage: null,
      confidence: null,
      failureReason: null,
      createdAt: now,
      updatedAt: now,
			deletedAt: null,
    });
  }

  static reconstruct(props: AnalysisProps): Analysis {
    return new Analysis(props);
  }

  markAsCompleted(input: {
    result: Record<string, unknown>;
    sourcePage?: number;
    confidence?: number;
  }): void {
    if (this.props.status !== "PENDING") {
      throw new InvalidAnalysisTransitionError(this.props.status, "COMPLETED");
    }

    this.props.status = "COMPLETED";
    this.props.result = input.result;
    this.props.sourcePage = input.sourcePage ?? null;
    this.props.confidence = input.confidence ?? null;
    this.props.updatedAt = new Date();
  }

  markAsFailed(reason: string): void {
    if (this.props.status !== "PENDING") {
      throw new InvalidAnalysisTransitionError(this.props.status, "FAILED");
    }

    this.props.status = "FAILED";
    this.props.failureReason = reason;
    this.props.updatedAt = new Date();
  }

	delete(): void {
		if (this.props.deletedAt) return;
		this.props.deletedAt = new Date();
	}

  get id() {
    return this.props.id;
  }
  get documentId() {
    return this.props.documentId;
  }
  get userId() {
    return this.props.userId;
  }
  get type() {
    return this.props.type;
  }
  get status() {
    return this.props.status;
  }
  get result() {
    return this.props.result;
  }
  get sourcePage() {
    return this.props.sourcePage;
  }
  get confidence() {
    return this.props.confidence;
  }
  get failureReason() {
    return this.props.failureReason;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
	get isDeleted(): boolean {
		return this.props.deletedAt !== null;
	}
}