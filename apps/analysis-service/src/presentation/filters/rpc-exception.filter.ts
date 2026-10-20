import { Catch, type ExceptionFilter, NotFoundException } from "@nestjs/common";
import { ZodError } from "zod";
import { AnalysisQuotaExceededError } from "../../domain/errors/analysis-quota-exceeded.error.js";
import { DuplicateAnalysisError } from "../../domain/errors/duplicate-analysis.error.js";

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: unknown) {
    if (exception instanceof ZodError) {
      return {
        error: "VALIDATION_ERROR",
        message: "Invalid payload",
        details: exception.issues,
      };
    }

    if (exception instanceof NotFoundException) {
      return { error: "NOT_FOUND", message: exception.message };
    }

    if (exception instanceof DuplicateAnalysisError) {
      return {
        error: "CONFLICT",
        message: "This analysis is already running for this document.",
      };
    }

    if (exception instanceof AnalysisQuotaExceededError) {
      return { error: "QUOTA_EXCEEDED", message: exception.message };
    }

    console.error("Unhandled error in RPC handler:", exception);
    return {
      error: "INTERNAL_ERROR",
      message: "Internal error while processing the request",
    };
  }
}
