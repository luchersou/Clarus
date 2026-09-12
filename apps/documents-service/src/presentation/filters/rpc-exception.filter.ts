import { Catch, NotFoundException } from "@nestjs/common";
import { BaseRpcExceptionFilter } from "@nestjs/microservices";
import { Observable, of } from "rxjs";
import { ZodError } from "zod";

@Catch()
export class RpcExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: unknown): Observable<any> {
    if (exception instanceof ZodError) {
      return of({
        error: "VALIDATION_ERROR",
        message: "Invalid payload",
        details: exception.issues,
      });
    }

    if (exception instanceof NotFoundException) {
      return of({
        error: "NOT_FOUND",
        message: exception.message,
      });
    }

    console.error("Unhandled error in RPC handler: ", exception);
    return of({
      error: "INTERNAL_ERROR",
      message: "Internal error while processing the request",
    });
  }
}