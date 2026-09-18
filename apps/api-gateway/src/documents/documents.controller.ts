import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/supabase-auth.guard.js";
import { DocumentsService } from "./documents.service.js";

@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    return this.documentsService.upload(user.id, file);
  }

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.list(user.id);
  }

  @Get(":id")
  async getById(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.getById(id, user.id);
  }

  @Delete(":id")
  async delete(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.delete(id, user.id);
  }
}