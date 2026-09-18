import { Controller, Post, Get, Delete, Param, Query, Body } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/supabase-auth.guard.js";
import { AnalysesService } from "./analyses.service.js";
import { RequestAnalysisBodySchema } from "./dto/request-analysis.dto.js";

@Controller("analyses")
export class AnalysesController {
  constructor(private readonly analysesService: AnalysesService) {}

  @Post()
  async request(@Body() body: unknown, @CurrentUser() user: AuthenticatedUser) {
    const dto = RequestAnalysisBodySchema.parse(body);
    return this.analysesService.request(dto.documentId, user.id, dto.type);
  }

  @Get()
  async list(
    @Query("documentId") documentId: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.analysesService.list(user.id, documentId);
  }

  @Get(":id")
  async getById(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.analysesService.getById(id, user.id);
  }

  @Delete(":id")
  async delete(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.analysesService.delete(id, user.id);
  }
}