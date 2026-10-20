import { randomUUID } from "node:crypto";
import type { AnalysisDomainEvent } from "./analysis-events.js";
import type { AnalysisStatus } from "./analysis-status.js";
import type { AnalysisType } from "./analysis-type.js";
import type { CreditStatus } from "./credit-status.js";
import { InvalidAnalysisTransitionError } from "./errors/invalid-analysis-transition.error.js";

export interface AnalysisProps {
  id: string;
  documentId: string;
  userId: string;
  type: AnalysisType;
  status: AnalysisStatus;
  creditStatus: CreditStatus;
  result: Record<string, unknown> | null;
  sourcePage: number | null;
  confidence: number | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
	deletedAt?: Date | null;
}

export class Analysis {
  private events: AnalysisDomainEvent[] = [];

  /** Status as last read from storage; null for an analysis that was never saved. */
  private constructor(
    private props: AnalysisProps,
    private readonly loadedStatus: AnalysisStatus | null,
  ) {}

  static create(input: {
    documentId: string;
    userId: string;
    type: AnalysisType;
  }): Analysis {
    const now = new Date();
    const analysis = new Analysis(
      {
      id: randomUUID(),
      documentId: input.documentId,
      userId: input.userId,
      type: input.type,
      status: "PENDING",
      creditStatus: "RESERVED",
      result: null,
      sourcePage: null,
      confidence: null,
      failureReason: null,
      createdAt: now,
      updatedAt: now,
			deletedAt: null,
      },
      null,
    );

    analysis.events.push({
      name: "AnalysisRequested",
      analysisId: analysis.id,
      documentId: analysis.documentId,
      userId: analysis.userId,
      type: analysis.type,
    });

    return analysis;
  }

  static reconstruct(props: AnalysisProps): Analysis {
    return new Analysis(props, props.status);
  }

  /** Returns the events recorded since the last call and clears them. */
  pullEvents(): AnalysisDomainEvent[] {
    const events = this.events;
    this.events = [];
    return events;
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
    this.props.creditStatus = "CONSUMED";
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
    // compensation: a failed analysis gives its credit back
    this.props.creditStatus = "REFUNDED";
    this.props.failureReason = reason;
    this.props.updatedAt = new Date();
  }

	delete(): void {
		if (this.props.deletedAt) return;
		this.props.deletedAt = new Date();
		// a pending analysis that is deleted will never complete, so its credit is released
		if (this.props.creditStatus === "RESERVED") this.props.creditStatus = "REFUNDED";
	}

  get persistedStatus(): AnalysisStatus | null {
    return this.loadedStatus;
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
  get creditStatus() {
    return this.props.creditStatus;
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
  get deletedAt() {
    return this.props.deletedAt;
  }
	get isDeleted(): boolean {
		return this.props.deletedAt !== null;
	}
}