import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from "@nestjs/common";
import { ZodError } from "zod";
import type { Response } from "express";

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const badRequest = new BadRequestException(exception.flatten());
    const status = badRequest.getStatus();

    response.status(status).json({
      statusCode: status,
      message: "Validation failed",
      errors: exception.flatten().fieldErrors,
    });
  }
}