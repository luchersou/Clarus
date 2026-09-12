import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadDocumentBodySchema } from "../application/dto/upload-document.dto.js";
import { UploadDocumentUseCase } from "../application/upload-document.use-case.js";
import { DocumentResponseMapper } from "./document-response.mapper.js";

@Controller("documents")
export class DocumentsController {
  constructor(private readonly uploadDocumentUseCase: UploadDocumentUseCase) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async upload(
		@UploadedFile() file: Express.Multer.File | undefined, 
		@Body() body: unknown
	) {

    if (!file) {
      throw new BadRequestException("File is required");
    }

    const dto = UploadDocumentBodySchema.parse(body);

    const document = await this.uploadDocumentUseCase.execute({
      ...dto,
      file: file.buffer,
    });

    return DocumentResponseMapper.toHttp(document);
  }
}