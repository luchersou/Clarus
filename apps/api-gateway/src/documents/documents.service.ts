import { BadRequestException, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import FormData from "form-data";
import { RPC_ROUTING_KEYS } from "@clarus/event-contracts";
import { RpcClientService } from "../shared/rpc-client.service.js";
import { mapRpcResponse, mapInfrastructureError } from "../shared/rpc-error.mapper.js";

@Injectable()
export class DocumentsService {
  private readonly documentsServiceUrl = process.env.DOCUMENTS_SERVICE_URL!;

  constructor(
    private readonly httpService: HttpService,
    private readonly rpcClient: RpcClientService,
  ) {}

  async upload(userId: string, file: Express.Multer.File): Promise<unknown> {
    const fileName = Buffer.from(file.originalname, "latin1").toString("utf8");

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("fileName", fileName);
    formData.append("fileType", this.mapFileType(file.mimetype));
    formData.append("file", file.buffer, fileName);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.documentsServiceUrl}/documents`, formData, {
          headers: formData.getHeaders(),
          timeout: 30000,
        }),
      );
      return response.data;
    } catch (error) {
      mapInfrastructureError(error);
    }
  }

  async list(userId: string): Promise<unknown> {
    try {
      const response = await this.rpcClient.request(RPC_ROUTING_KEYS.DOCUMENTS_LIST, {
        userId,
      });
      return mapRpcResponse(response);
    } catch (error) {
      mapInfrastructureError(error);
    }
  }

  async getById(documentId: string, userId: string): Promise<unknown> {
    try {
      const response = await this.rpcClient.request(RPC_ROUTING_KEYS.DOCUMENTS_GET_BY_ID, {
        documentId,
        userId,
      });
      return mapRpcResponse(response);
    } catch (error) {
      mapInfrastructureError(error);
    }
  }

  async delete(documentId: string, userId: string): Promise<unknown> {
    try {
      const response = await this.rpcClient.request(RPC_ROUTING_KEYS.DOCUMENTS_DELETE, {
        documentId,
        userId,
      });
      return mapRpcResponse(response);
    } catch (error) {
      mapInfrastructureError(error);
    }
  }

  private mapFileType(mimetype: string): string {
    const map: Record<string, string> = {
      "application/pdf": "PDF",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    };

    const fileType = map[mimetype];
    if (!fileType) {
      throw new BadRequestException(`Unsupported file type: ${mimetype}`);
    }

    return fileType;
  }
}