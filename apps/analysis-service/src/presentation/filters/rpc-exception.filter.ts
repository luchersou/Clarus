import { Catch, type ExceptionFilter, NotFoundException } from "@nestjs/common";
import { ZodError } from "zod";

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: unknown) {
    console.log("FILTER HIT:", exception);
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

    console.error("Unhandled error in RPC handler:", exception);
    return {
      error: "INTERNAL_ERROR",
      message: "Internal error while processing the request",
    };
  }
}